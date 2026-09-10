package zhipu_4v

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	channelconstant "github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/relay/channel"
	"github.com/QuantumNous/new-api/relay/channel/claude"
	"github.com/QuantumNous/new-api/relay/channel/openai"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	relayconstant "github.com/QuantumNous/new-api/relay/constant"
	"github.com/QuantumNous/new-api/types"
	"github.com/samber/lo"

	"github.com/gin-gonic/gin"
)

type Adaptor struct {
}

func (a *Adaptor) ConvertGeminiRequest(*gin.Context, *relaycommon.RelayInfo, *dto.GeminiChatRequest) (any, error) {
	//TODO implement me
	return nil, errors.New("not implemented")
}

func (a *Adaptor) ConvertClaudeRequest(c *gin.Context, info *relaycommon.RelayInfo, req *dto.ClaudeRequest) (any, error) {
	return req, nil
}

func (a *Adaptor) ConvertAudioRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.AudioRequest) (io.Reader, error) {
	//TODO implement me
	return nil, errors.New("not implemented")
}

func (a *Adaptor) ConvertImageRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.ImageRequest) (any, error) {
	return request, nil
}

func (a *Adaptor) Init(info *relaycommon.RelayInfo) {
}

func (a *Adaptor) GetRequestURL(info *relaycommon.RelayInfo) (string, error) {
	baseURL := info.ChannelBaseUrl
	if baseURL == "" {
		baseURL = channelconstant.ChannelBaseURLs[channelconstant.ChannelTypeZhipu_v4]
	}
	specialPlan, hasSpecialPlan := channelconstant.ChannelSpecialBases[baseURL]

	switch info.RelayFormat {
	case types.RelayFormatClaude:
		if hasSpecialPlan && specialPlan.ClaudeBaseURL != "" {
			return fmt.Sprintf("%s/v1/messages", specialPlan.ClaudeBaseURL), nil
		}
		return fmt.Sprintf("%s/api/anthropic/v1/messages", baseURL), nil
	default:
		switch info.RelayMode {
		case relayconstant.RelayModeEmbeddings:
			if hasSpecialPlan && specialPlan.OpenAIBaseURL != "" {
				return fmt.Sprintf("%s/embeddings", specialPlan.OpenAIBaseURL), nil
			}
			return fmt.Sprintf("%s/api/paas/v4/embeddings", baseURL), nil
		case relayconstant.RelayModeImagesGenerations:
			if hasSpecialPlan && specialPlan.OpenAIBaseURL != "" {
				return fmt.Sprintf("%s/images/generations", specialPlan.OpenAIBaseURL), nil
			}
			return fmt.Sprintf("%s/api/paas/v4/images/generations", baseURL), nil
		default:
			if hasSpecialPlan && specialPlan.OpenAIBaseURL != "" {
				return fmt.Sprintf("%s/chat/completions", specialPlan.OpenAIBaseURL), nil
			}
			return fmt.Sprintf("%s/api/paas/v4/chat/completions", baseURL), nil
		}
	}
}

func (a *Adaptor) SetupRequestHeader(c *gin.Context, req *http.Header, info *relaycommon.RelayInfo) error {
	channel.SetupApiRequestHeader(info, c, req)
	req.Set("Authorization", "Bearer "+info.ApiKey)
	return nil
}

func (a *Adaptor) ConvertOpenAIRequest(c *gin.Context, info *relaycommon.RelayInfo, request *dto.GeneralOpenAIRequest) (any, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	if lo.FromPtrOr(request.TopP, 0) >= 1 {
		request.TopP = lo.ToPtr(0.99)
	}
	return requestOpenAI2Zhipu(*request), nil
}

func (a *Adaptor) ConvertRerankRequest(c *gin.Context, relayMode int, request dto.RerankRequest) (any, error) {
	return nil, nil
}

func (a *Adaptor) ConvertEmbeddingRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.EmbeddingRequest) (any, error) {
	return request, nil
}

// responsesInputToMessages 把 Responses API 的 input 字段转成 chat messages。
// 支持：字符串、[{role, content}] 多轮数组；content 内支持 input_text / output_text / input_image。
func responsesInputToMessages(input []byte) []dto.Message {
	if len(input) == 0 {
		return nil
	}
	var msgs []dto.Message
	if common.GetJsonType(input) == "string" {
		var s string
		if err := common.Unmarshal(input, &s); err == nil && s != "" {
			msgs = append(msgs, dto.Message{Role: "user", Content: s})
		}
		return msgs
	}
	var inputs []dto.Input
	if err := common.Unmarshal(input, &inputs); err != nil {
		return nil
	}
	for _, in := range inputs {
		role := in.Role
		if role != "user" && role != "assistant" {
			continue
		}
		if common.GetJsonType(in.Content) == "string" {
			var s string
			_ = common.Unmarshal(in.Content, &s)
			if s != "" {
				msgs = append(msgs, dto.Message{Role: role, Content: s})
			}
			continue
		}
		var parts []map[string]any
		if err := common.Unmarshal(in.Content, &parts); err != nil {
			continue
		}
		var textParts []string
		var images []string
		for _, p := range parts {
			typ, _ := p["type"].(string)
			switch typ {
			case "input_text", "output_text":
				if t, ok := p["text"].(string); ok {
					textParts = append(textParts, t)
				}
			case "input_image":
				switch v := p["image_url"].(type) {
				case string:
					images = append(images, v)
				case map[string]any:
					if u, ok := v["url"].(string); ok {
						images = append(images, u)
					}
				}
			}
		}
		text := strings.Join(textParts, "\n")
		if len(images) == 0 {
			if text != "" {
				msgs = append(msgs, dto.Message{Role: role, Content: text})
			}
			continue
		}
		content := make([]map[string]any, 0, len(images)+1)
		if text != "" {
			content = append(content, map[string]any{"type": "text", "text": text})
		}
		for _, img := range images {
			content = append(content, map[string]any{
				"type":      "image_url",
				"image_url": map[string]any{"url": img},
			})
		}
		msgs = append(msgs, dto.Message{Role: role, Content: content})
	}
	return msgs
}

func (a *Adaptor) ConvertOpenAIResponsesRequest(c *gin.Context, info *relaycommon.RelayInfo, request dto.OpenAIResponsesRequest) (any, error) {
	req := &dto.GeneralOpenAIRequest{Model: request.Model}

	// instructions → system 消息
	if len(request.Instructions) > 0 && common.GetJsonType(request.Instructions) == "string" {
		var instr string
		if err := common.Unmarshal(request.Instructions, &instr); err == nil && strings.TrimSpace(instr) != "" {
			req.Messages = append(req.Messages, dto.Message{Role: "system", Content: instr})
		}
	}

	// input → messages（多轮 + 多模态）
	req.Messages = append(req.Messages, responsesInputToMessages(request.Input)...)

	// 参数映射
	req.MaxTokens = request.MaxOutputTokens
	req.Temperature = request.Temperature
	req.TopP = request.TopP

	// tools（responses 与 chat 的 function 工具结构一致）
	if len(request.Tools) > 0 {
		var tools []dto.ToolCallRequest
		if err := common.Unmarshal(request.Tools, &tools); err == nil && len(tools) > 0 {
			req.Tools = tools
		}
	}
	if len(request.ToolChoice) > 0 && common.GetJsonType(request.ToolChoice) == "string" {
		var tc string
		if err := common.Unmarshal(request.ToolChoice, &tc); err == nil {
			req.ToolChoice = tc
		}
	}

	// 强制非流式拉上游，响应端做伪流式包装（绕开智谱流式格式差异）
	streamFalse := false
	req.Stream = &streamFalse

	return req, nil
}

func (a *Adaptor) DoRequest(c *gin.Context, info *relaycommon.RelayInfo, requestBody io.Reader) (any, error) {
	return channel.DoApiRequest(a, c, info, requestBody)
}

func (a *Adaptor) DoResponse(c *gin.Context, resp *http.Response, info *relaycommon.RelayInfo) (usage any, err *types.NewAPIError) {
	if info.RelayMode == relayconstant.RelayModeResponses {
		return zhipu4vResponsesHandler(c, info, resp)
	}
	switch info.RelayFormat {
	case types.RelayFormatClaude:
		adaptor := claude.Adaptor{}
		return adaptor.DoResponse(c, resp, info)
	default:
		if info.RelayMode == relayconstant.RelayModeImagesGenerations {
			return zhipu4vImageHandler(c, resp, info)
		}
		adaptor := openai.Adaptor{}
		return adaptor.DoResponse(c, resp, info)
	}
}

func (a *Adaptor) GetModelList() []string {
	return ModelList
}

func (a *Adaptor) GetChannelName() string {
	return ChannelName
}
