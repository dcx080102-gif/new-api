package relay

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/logger"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	relayconstant "github.com/QuantumNous/new-api/relay/constant"
	"github.com/QuantumNous/new-api/relay/helper"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/model_setting"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/QuantumNous/new-api/types"
	"github.com/samber/lo"

	"github.com/gin-gonic/gin"
)

// —— 上游流式 bug 兜底：gpt-6-astra 的流式接口返回空 choices（上游问题），
// 这里强制转成非流式拉取，拿到完整响应后包装成 SSE 流回给客户端，
// 游乐园和第三方客户端均无感知。
type captureWriter struct {
	gin.ResponseWriter
	buffer *bytes.Buffer
	status int
}

func (w *captureWriter) Write(p []byte) (int, error)  { return w.buffer.Write(p) }
func (w *captureWriter) WriteString(s string) (int, error) { return w.buffer.WriteString(s) }
func (w *captureWriter) WriteHeader(code int)         { w.status = code }
func (w *captureWriter) Status() int                  { return w.status }
func (w *captureWriter) Size() int                    { return w.buffer.Len() }
func (w *captureWriter) Written() bool                { return w.status != 0 }
func (w *captureWriter) Flush()                       {}

type bufferedChatResponse struct {
	ID      string `json:"id"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		FinishReason *string `json:"finish_reason"`
	} `json:"choices"`
}

func emitBufferedAsSSE(w gin.ResponseWriter, buffer *bytes.Buffer) {
	var resp bufferedChatResponse
	if err := common.Unmarshal(buffer.Bytes(), &resp); err != nil || len(resp.Choices) == 0 {
		// 解析失败：原样回传
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(buffer.Bytes())
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)

	choice := resp.Choices[0]
	contentRunes := []rune(choice.Message.Content)
	const chunkSize = 16
	first := true
	for i := 0; i < len(contentRunes) || first; i += chunkSize {
		end := i + chunkSize
		if end > len(contentRunes) {
			end = len(contentRunes)
		}
		delta := map[string]any{}
		if first {
			delta["role"] = "assistant"
			first = false
		}
		if i < len(contentRunes) {
			delta["content"] = string(contentRunes[i:end])
		}
		chunk := map[string]any{
			"id":      "chatcmpl-" + resp.ID,
			"object":  "chat.completion.chunk",
			"created": resp.Created,
			"model":   resp.Model,
			"choices": []map[string]any{{"index": 0, "delta": delta, "finish_reason": nil}},
		}
		b, _ := common.Marshal(chunk)
		_, _ = fmt.Fprintf(w, "data: %s\n\n", b)
	}
	finishReason := choice.FinishReason
	if finishReason == nil {
		stop := "stop"
		finishReason = &stop
	}
	finChunk := map[string]any{
		"id":      "chatcmpl-" + resp.ID,
		"object":  "chat.completion.chunk",
		"created": resp.Created,
		"model":   resp.Model,
		"choices": []map[string]any{{"index": 0, "delta": map[string]any{}, "finish_reason": finishReason}},
	}
	bf, _ := common.Marshal(finChunk)
	_, _ = fmt.Fprintf(w, "data: %s\n\n", bf)
	_, _ = fmt.Fprint(w, "data: [DONE]\n\n")
	if f, ok := w.(http.Flusher); ok {
		f.Flush()
	}
}

func TextHelper(c *gin.Context, info *relaycommon.RelayInfo) (newAPIError *types.NewAPIError) {
	info.InitChannelMeta(c)

	textReq, ok := info.Request.(*dto.GeneralOpenAIRequest)
	if !ok {
		return types.NewErrorWithStatusCode(fmt.Errorf("invalid request type, expected dto.GeneralOpenAIRequest, got %T", info.Request), types.ErrorCodeInvalidRequest, http.StatusBadRequest, types.ErrOptionWithSkipRetry())
	}

	request, err := common.DeepCopy(textReq)
	if err != nil {
		return types.NewError(fmt.Errorf("failed to copy request to GeneralOpenAIRequest: %w", err), types.ErrorCodeInvalidRequest, types.ErrOptionWithSkipRetry())
	}

	// otter Link 补丁：上游 gpt-6-astra 流式接口不稳定（空流/部分节点未同步新模型），
	// 强制用非流式请求上游，再把完整响应包装成 SSE delta 格式返回给客户端
	forceAstraBufferStream := info.RelayMode == relayconstant.RelayModeChatCompletions &&
		info.OriginModelName == "gpt-6-astra" &&
		lo.FromPtrOr(request.Stream, false)
	if forceAstraBufferStream {
		request.Stream = lo.ToPtr(false)
	}

	if request.WebSearchOptions != nil {
		c.Set("chat_completion_web_search_context_size", request.WebSearchOptions.SearchContextSize)
	}

	err = helper.ModelMappedHelper(c, info, request)
	if err != nil {
		return types.NewError(err, types.ErrorCodeChannelModelMappedError, types.ErrOptionWithSkipRetry())
	}

	includeUsage := true
	// 判断用户是否需要返回使用情况
	if request.StreamOptions != nil {
		includeUsage = request.StreamOptions.IncludeUsage
	}

	// 如果不支持StreamOptions，将StreamOptions设置为nil
	if !info.SupportStreamOptions || !lo.FromPtrOr(request.Stream, false) {
		request.StreamOptions = nil
	} else {
		// 如果支持StreamOptions，且请求中没有设置StreamOptions，根据配置文件设置StreamOptions
		if constant.ForceStreamOption {
			request.StreamOptions = &dto.StreamOptions{
				IncludeUsage: true,
			}
		}
	}

	info.ShouldIncludeUsage = includeUsage

	adaptor := GetAdaptor(info.ApiType)
	if adaptor == nil {
		return types.NewError(fmt.Errorf("invalid api type: %d", info.ApiType), types.ErrorCodeInvalidApiType, types.ErrOptionWithSkipRetry())
	}
	adaptor.Init(info)

	passThroughGlobal := model_setting.GetGlobalSettings().PassThroughRequestEnabled
	if info.RelayMode == relayconstant.RelayModeChatCompletions &&
		!passThroughGlobal &&
		!info.ChannelSetting.PassThroughBodyEnabled &&
		service.ShouldChatCompletionsUseResponsesGlobal(info.ChannelId, info.ChannelType, info.OriginModelName) {
		applySystemPromptIfNeeded(c, info, request)
		usage, newApiErr := chatCompletionsViaResponses(c, info, adaptor, request)
		if newApiErr != nil {
			return newApiErr
		}

		var containAudioTokens = usage.CompletionTokenDetails.AudioTokens > 0 || usage.PromptTokensDetails.AudioTokens > 0
		var containsAudioRatios = ratio_setting.ContainsAudioRatio(info.OriginModelName) || ratio_setting.ContainsAudioCompletionRatio(info.OriginModelName)

		if containAudioTokens && containsAudioRatios {
			service.PostAudioConsumeQuota(c, info, usage, "")
		} else {
			service.PostTextConsumeQuota(c, info, usage, nil)
		}
		return nil
	}

	var requestBody io.Reader

	// gpt-6-astra 上游流式有 bug（返回空 choices）——强制转非流式，稍后包装回 SSE
	forceBufferStream := false
	if strings.EqualFold(info.OriginModelName, "gpt-6-astra") && lo.FromPtrOr(request.Stream, false) {
		forceBufferStream = true
		request.Stream = lo.ToPtr(false)
		request.StreamOptions = nil
		info.IsStream = false
	}

	if passThroughGlobal || info.ChannelSetting.PassThroughBodyEnabled {
		storage, err := common.GetBodyStorage(c)
		if err != nil {
			return types.NewErrorWithStatusCode(err, types.ErrorCodeReadRequestBodyFailed, http.StatusBadRequest, types.ErrOptionWithSkipRetry())
		}
		if common.DebugEnabled {
			if debugBytes, bErr := storage.Bytes(); bErr == nil {
				logger.LogDebug(c, "requestBody: %s", debugBytes)
			}
		}
		if forceBufferStream {
			// 透传模式下原样透传客户端 body，需要把 stream 字段改写为 false
			if rawBytes, bErr := storage.Bytes(); bErr == nil {
				var rawMap map[string]any
				if common.Unmarshal(rawBytes, &rawMap) == nil {
					rawMap["stream"] = false
					if newBytes, mErr := common.Marshal(rawMap); mErr == nil {
						requestBody = bytes.NewReader(newBytes)
					}
				}
			}
		}
		if requestBody == nil {
			requestBody = common.ReaderOnly(storage)
		}
	} else {
		convertedRequest, err := adaptor.ConvertOpenAIRequest(c, info, request)
		if err != nil {
			return types.NewError(err, types.ErrorCodeConvertRequestFailed, types.ErrOptionWithSkipRetry())
		}
		relaycommon.AppendRequestConversionFromRequest(info, convertedRequest)

		if info.ChannelSetting.SystemPrompt != "" {
			// 如果有系统提示，则将其添加到请求中
			request, ok := convertedRequest.(*dto.GeneralOpenAIRequest)
			if ok {
				containSystemPrompt := false
				for _, message := range request.Messages {
					if message.Role == request.GetSystemRoleName() {
						containSystemPrompt = true
						break
					}
				}
				if !containSystemPrompt {
					// 如果没有系统提示，则添加系统提示
					systemMessage := dto.Message{
						Role:    request.GetSystemRoleName(),
						Content: info.ChannelSetting.SystemPrompt,
					}
					request.Messages = append([]dto.Message{systemMessage}, request.Messages...)
				} else if info.ChannelSetting.SystemPromptOverride {
					common.SetContextKey(c, constant.ContextKeySystemPromptOverride, true)
					// 如果有系统提示，且允许覆盖，则拼接到前面
					for i, message := range request.Messages {
						if message.Role == request.GetSystemRoleName() {
							if message.IsStringContent() {
								request.Messages[i].SetStringContent(info.ChannelSetting.SystemPrompt + "\n" + message.StringContent())
							} else {
								contents := message.ParseContent()
								contents = append([]dto.MediaContent{
									{
										Type: dto.ContentTypeText,
										Text: info.ChannelSetting.SystemPrompt,
									},
								}, contents...)
								request.Messages[i].Content = contents
							}
							break
						}
					}
				}
			}
		}

		jsonData, err := common.Marshal(convertedRequest)
		if err != nil {
			return types.NewError(err, types.ErrorCodeJsonMarshalFailed, types.ErrOptionWithSkipRetry())
		}

		// remove disabled fields for OpenAI API
		jsonData, err = relaycommon.RemoveDisabledFields(jsonData, info.ChannelOtherSettings, info.ChannelSetting.PassThroughBodyEnabled)
		if err != nil {
			return types.NewError(err, types.ErrorCodeConvertRequestFailed, types.ErrOptionWithSkipRetry())
		}

		// apply param override
		if len(info.ParamOverride) > 0 {
			jsonData, err = relaycommon.ApplyParamOverrideWithRelayInfo(jsonData, info)
			if err != nil {
				return newAPIErrorFromParamOverride(err)
			}
		}

		logger.LogDebug(c, "text request body: %s", jsonData)

		body, size, closer, err := relaycommon.NewOutboundJSONBody(jsonData)
		if err != nil {
			return types.NewError(err, types.ErrorCodeConvertRequestFailed, types.ErrOptionWithSkipRetry())
		}
		defer closer.Close()
		jsonData = nil
		info.UpstreamRequestBodySize = size
		requestBody = body
	}

	var httpResp *http.Response
	succeeded := false
	var origWriter gin.ResponseWriter
	var capW *captureWriter
	if forceBufferStream {
		origWriter = c.Writer
		capW = &captureWriter{ResponseWriter: origWriter, buffer: &bytes.Buffer{}}
		c.Writer = capW
		defer func() {
			c.Writer = origWriter
			if succeeded {
				emitBufferedAsSSE(origWriter, capW.buffer)
			}
		}()
	}
	resp, err := adaptor.DoRequest(c, info, requestBody)
	if err != nil {
		return types.NewOpenAIError(err, types.ErrorCodeDoRequestFailed, http.StatusInternalServerError)
	}

	statusCodeMappingStr := c.GetString("status_code_mapping")

	if resp != nil {
		httpResp = resp.(*http.Response)
		info.IsStream = info.IsStream || strings.HasPrefix(httpResp.Header.Get("Content-Type"), "text/event-stream")
		if httpResp.StatusCode != http.StatusOK {
			newApiErr := service.RelayErrorHandler(c.Request.Context(), httpResp, false)
			// reset status code 重置状态码
			service.ResetStatusCode(newApiErr, statusCodeMappingStr)
			return newApiErr
		}
	}

	var usage any
	var newApiErr *types.NewAPIError
	if forceAstraBufferStream {
		usage, newApiErr = relayAstraBufferedStream(c, info, httpResp)
	} else {
		usage, newApiErr = adaptor.DoResponse(c, httpResp, info)
	}
	if newApiErr != nil {
		// reset status code 重置状态码
		service.ResetStatusCode(newApiErr, statusCodeMappingStr)
		return newApiErr
	}
	if forceBufferStream {
		succeeded = true
	}

	var containAudioTokens = usage.(*dto.Usage).CompletionTokenDetails.AudioTokens > 0 || usage.(*dto.Usage).PromptTokensDetails.AudioTokens > 0
	var containsAudioRatios = ratio_setting.ContainsAudioRatio(info.OriginModelName) || ratio_setting.ContainsAudioCompletionRatio(info.OriginModelName)

	if containAudioTokens && containsAudioRatios {
		service.PostAudioConsumeQuota(c, info, usage.(*dto.Usage), "")
	} else {
		service.PostTextConsumeQuota(c, info, usage.(*dto.Usage), nil)
	}
	return nil
}

// relayAstraBufferedStream 是 otter Link 的模型级补丁：上游 gpt-6-astra 的流式接口不稳定
// （间歇性返回空流，部分上游节点报"模型不支持"），而非流式接口稳定。
// 这里把上游的完整非流式 JSON 响应读出来，包装成单条 SSE delta 块 + [DONE] 返回，
// 让游乐园和所有流式客户端都能正常显示结果。
func relayAstraBufferedStream(c *gin.Context, info *relaycommon.RelayInfo, resp *http.Response) (any, *types.NewAPIError) {
	if resp == nil || resp.Body == nil {
		return nil, types.NewOpenAIError(fmt.Errorf("invalid response"), types.ErrorCodeBadResponse, http.StatusInternalServerError)
	}
	defer service.CloseResponseBodyGracefully(resp)

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeReadResponseBodyFailed, http.StatusInternalServerError)
	}

	var completion struct {
		Id      string `json:"id"`
		Created int64  `json:"created"`
		Choices []struct {
			Message struct {
				Content interface{} `json:"content"`
			} `json:"message"`
			FinishReason string `json:"finish_reason"`
		} `json:"choices"`
		Usage dto.Usage `json:"usage"`
	}
	if err := common.Unmarshal(data, &completion); err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeBadResponseBody, http.StatusInternalServerError)
	}

	content := ""
	finishReason := "stop"
	if len(completion.Choices) > 0 {
		if s, ok := completion.Choices[0].Message.Content.(string); ok {
			content = s
		}
		if completion.Choices[0].FinishReason != "" {
			finishReason = completion.Choices[0].FinishReason
		}
	}

	chunk := map[string]interface{}{
		"id":      completion.Id,
		"object":  "chat.completion.chunk",
		"created": completion.Created,
		"model":   info.UpstreamModelName,
		"choices": []map[string]interface{}{
			{
				"index": 0,
				"delta": map[string]interface{}{
					"role":    "assistant",
					"content": content,
				},
				"finish_reason": finishReason,
			},
		},
	}
	chunkData, err := common.Marshal(chunk)
	if err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeJsonMarshalFailed, http.StatusInternalServerError)
	}

	c.Writer.WriteString("data: " + string(chunkData) + "\n\n")
	c.Writer.WriteString("data: [DONE]\n\n")
	c.Writer.Flush()

	return &completion.Usage, nil
}
