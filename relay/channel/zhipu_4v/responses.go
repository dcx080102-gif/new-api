package zhipu_4v

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/relay/helper"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

// stripThinkBlock 移除 glm-z 系列输出里的 <think>...</think> 思考块，只留正文。
func stripThinkBlock(s string) string {
	s = strings.TrimSpace(s)
	if !strings.HasPrefix(s, "<think>") {
		return s
	}
	if idx := strings.Index(s, "</think>"); idx != -1 {
		return strings.TrimSpace(s[idx+len("</think>"):])
	}
	// 未闭合的 think：整段都是思考，无正文
	return ""
}

// buildResponsesResponse 把上游返回的标准 chat 响应包装成 Responses API 格式。
func buildResponsesResponse(info *relaycommon.RelayInfo, chatResp *dto.OpenAITextResponse) *dto.OpenAIResponsesResponse {
	model := chatResp.Model
	if model == "" && info != nil {
		model = info.OriginModelName
	}

	output := make([]dto.ResponsesOutput, 0, 2)
	var text string
	hasToolCalls := false

	if len(chatResp.Choices) > 0 {
		msg := chatResp.Choices[0].Message
		text = stripThinkBlock(msg.StringContent())
		if len(msg.ToolCalls) > 0 {
			var calls []dto.ToolCallResponse
			if err := common.Unmarshal(msg.ToolCalls, &calls); err == nil {
				for _, call := range calls {
					if call.Function.Name == "" {
						continue
					}
					output = append(output, dto.ResponsesOutput{
						Type:      "function_call",
						ID:        "fc_" + common.GetUUID(),
						CallId:    call.ID,
						Name:      call.Function.Name,
						Arguments: json.RawMessage(call.Function.Arguments),
						Status:    "completed",
					})
					hasToolCalls = true
				}
			}
		}
	}

	// 无工具调用（或文本兜底）时输出 message item
	if text != "" || !hasToolCalls {
		content := []dto.ResponsesOutputContent{
			{Type: "output_text", Text: text},
		}
		msgItem := dto.ResponsesOutput{
			Type:    "message",
			ID:      "msg_" + common.GetUUID(),
			Status:  "completed",
			Role:    "assistant",
			Content: content,
		}
		output = append([]dto.ResponsesOutput{msgItem}, output...)
	}

	usage := &dto.Usage{
		PromptTokens:         chatResp.Usage.PromptTokens,
		CompletionTokens:     chatResp.Usage.CompletionTokens,
		TotalTokens:          chatResp.Usage.TotalTokens,
		InputTokens:          chatResp.Usage.InputTokens,
		OutputTokens:         chatResp.Usage.OutputTokens,
		InputTokensDetails: &dto.InputTokenDetails{
			CachedTokens: chatResp.Usage.PromptTokensDetails.CachedTokens,
		},
	}

	return &dto.OpenAIResponsesResponse{
		ID:                "resp_" + common.GetUUID(),
		Object:            "response",
		CreatedAt:         int(time.Now().Unix()),
		Status:            json.RawMessage(`"completed"`),
		Model:             model,
		Output:            output,
		ParallelToolCalls: true,
		Store:             true,
		Temperature:       1,
		TopP:              1,
		ToolChoice:        json.RawMessage(`"auto"`),
		Truncation:        json.RawMessage(`"disabled"`),
		Usage:             usage,
	}
}

// zhipu4vResponsesHandler 处理 /v1/responses 请求的响应：上游（非流式 chat）→ 客户端 responses 格式。
// 客户端请求流式时做伪流式 SSE 包装。
func zhipu4vResponsesHandler(c *gin.Context, info *relaycommon.RelayInfo, resp *http.Response) (*dto.Usage, *types.NewAPIError) {
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeReadResponseBodyFailed, http.StatusInternalServerError)
	}
	service.CloseResponseBodyGracefully(resp)

	var chatResp dto.OpenAITextResponse
	if err := json.Unmarshal(responseBody, &chatResp); err != nil {
		return nil, types.NewOpenAIError(err, types.ErrorCodeBadResponseBody, http.StatusInternalServerError)
	}
	if chatResp.Error != nil {
		if oaiErr := chatResp.GetOpenAIError(); oaiErr != nil && oaiErr.Message != "" {
			return nil, types.WithOpenAIError(*oaiErr, resp.StatusCode)
		}
	}

	responsesResp := buildResponsesResponse(info, &chatResp)

	if !info.IsStream {
		// 非流式：直接返回 JSON
		jsonData, err := json.Marshal(responsesResp)
		if err != nil {
			return nil, types.NewError(err, types.ErrorCodeBadResponseBody)
		}
		c.Writer.Header().Set("Content-Type", "application/json")
		c.Writer.WriteHeader(resp.StatusCode)
		_, _ = c.Writer.Write(jsonData)
		return responsesResp.Usage, nil
	}

	// 伪流式 SSE：把完整结果按官方事件序列拆发，客户端无需感知非流式上游
	helper.SetEventStreamHeaders(c)
	marshalEvent := func(ev any) string {
		b, err := json.Marshal(ev)
		if err != nil {
			return ""
		}
		return string(b)
	}

	var itemEvents, partEvents, deltaEvents, doneEvents []string
	var msgID string
	var msgItem dto.ResponsesOutput
	var fcItems []dto.ResponsesOutput

	for _, item := range responsesResp.Output {
		switch item.Type {
		case "message":
			msgItem = item
			msgID = item.ID
		case "function_call":
			fcItems = append(fcItems, item)
		}
	}

	if msgID != "" {
		text := ""
		if len(msgItem.Content) > 0 {
			text = msgItem.Content[0].Text
		}
		itemEvents = append(itemEvents, marshalEvent(map[string]any{
			"type":         "response.output_item.added",
			"output_index": 0,
			"item": map[string]any{
				"id": msgID, "type": "message", "status": "in_progress",
				"role": "assistant", "content": []any{},
			},
		}))
		partEvents = append(partEvents, marshalEvent(map[string]any{
			"type":         "response.content_part.added",
			"item_id":      msgID,
			"output_index": 0,
			"content_index": 0,
			"part": map[string]any{
				"type": "output_text", "text": "", "annotations": []any{},
			},
		}))
		deltaEvents = append(deltaEvents, marshalEvent(map[string]any{
			"type":         "response.output_text.delta",
			"item_id":      msgID,
			"output_index": 0,
			"content_index": 0,
			"delta":        text,
		}))
		deltaEvents = append(deltaEvents, marshalEvent(map[string]any{
			"type":         "response.output_text.done",
			"item_id":      msgID,
			"output_index": 0,
			"content_index": 0,
			"text":         text,
		}))
		doneEvents = append(doneEvents, marshalEvent(map[string]any{
			"type":         "response.content_part.done",
			"item_id":      msgID,
			"output_index": 0,
			"content_index": 0,
			"part": map[string]any{
				"type": "output_text", "text": text, "annotations": []any{},
			},
		}))
		doneEvents = append(doneEvents, marshalEvent(map[string]any{
			"type":         "response.output_item.done",
			"output_index": 0,
			"item": map[string]any{
				"id": msgID, "type": "message", "status": "completed",
				"role": "assistant", "content": []any{
					map[string]any{"type": "output_text", "text": text, "annotations": []any{}},
				},
			},
		}))
	}

	for i, fc := range fcItems {
		itemEvents = append(itemEvents, marshalEvent(map[string]any{
			"type":         "response.output_item.added",
			"output_index": i + 1,
			"item": map[string]any{
				"id": fc.ID, "type": "function_call", "status": "in_progress",
				"call_id": fc.CallId, "name": fc.Name, "arguments": "",
			},
		}))
		doneEvents = append(doneEvents, marshalEvent(map[string]any{
			"type":         "response.output_item.done",
			"output_index": i + 1,
			"item": map[string]any{
				"id": fc.ID, "type": "function_call", "status": "completed",
				"call_id": fc.CallId, "name": fc.Name, "arguments": string(fc.Arguments),
			},
		}))
	}

	created := marshalEvent(map[string]any{
		"type":     "response.created",
		"response": responsesResp,
	})
	inProgress := marshalEvent(map[string]any{
		"type":     "response.in_progress",
		"response": responsesResp,
	})
	completed := marshalEvent(map[string]any{
		"type":     "response.completed",
		"response": responsesResp,
	})

	c.Stream(func(w io.Writer) bool {
		fmt.Fprintf(w, "data: %s\n\n", created)
		fmt.Fprintf(w, "data: %s\n\n", inProgress)
		for _, ev := range itemEvents {
			fmt.Fprintf(w, "data: %s\n\n", ev)
		}
		for _, ev := range partEvents {
			fmt.Fprintf(w, "data: %s\n\n", ev)
		}
		for _, ev := range deltaEvents {
			fmt.Fprintf(w, "data: %s\n\n", ev)
		}
		for _, ev := range doneEvents {
			fmt.Fprintf(w, "data: %s\n\n", ev)
		}
		fmt.Fprintf(w, "data: %s\n\n", completed)
		fmt.Fprint(w, "data: [DONE]\n\n")
		return false
	})

	return responsesResp.Usage, nil
}
