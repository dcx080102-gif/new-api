/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import type {
  ChatCompletionRequest,
  Message,
  PlaygroundConfig,
  ParameterEnabled,
} from '../types'
import {
  formatMessageForAPI,
  getTextContent,
  isValidMessage,
} from './message-utils'

// 裁剪参数：最多回传最近 30 条消息；图片附件只保留最近 3 条用户消息的
const MAX_HISTORY_MESSAGES = 30
const MAX_IMAGE_USER_MESSAGES = 3
// 单条消息文本超过该字符数视为垃圾（旧对话里的 base64 图片），自动省略
const MAX_CONTENT_CHARS = 12000

/**
 * Build API request payload from messages and config
 */
export function buildChatCompletionPayload(
  messages: Message[],
  config: PlaygroundConfig,
  parameterEnabled: ParameterEnabled
): ChatCompletionRequest {
  // Filter and format valid messages
  let processedMessages = messages
    .filter(isValidMessage)
    .map(formatMessageForAPI)

  // 旧消息自动裁剪：防止请求体（尤其 base64 图片）无限膨胀撑爆上下文
  // 1. 只保留最近 MAX_HISTORY_MESSAGES 条消息
  if (processedMessages.length > MAX_HISTORY_MESSAGES) {
    processedMessages = processedMessages.slice(-MAX_HISTORY_MESSAGES)
  }
  // 2. 图片只保留最近 MAX_IMAGE_USER_MESSAGES 条用户消息的，更早的剥掉图片（保留文字）
  let imageBudget = MAX_IMAGE_USER_MESSAGES
  for (let i = processedMessages.length - 1; i >= 0; i--) {
    const apiMessage = processedMessages[i]
    if (apiMessage.role !== 'user' || typeof apiMessage.content === 'string') {
      continue
    }
    if (imageBudget > 0) {
      imageBudget -= 1
      continue
    }
    processedMessages[i] = {
      ...apiMessage,
      content: getTextContent(apiMessage.content),
    }
  }
  // 3. 超长文本（旧对话里存下的 base64 图片等）用占位符替换，避免撑爆上下文
  for (let i = 0; i < processedMessages.length; i++) {
    const apiMessage = processedMessages[i]
    if (
      typeof apiMessage.content === 'string' &&
      apiMessage.content.length > MAX_CONTENT_CHARS
    ) {
      processedMessages[i] = {
        ...apiMessage,
        content: `[Previous message content omitted (${apiMessage.content.length} characters)]`,
      }
    }
  }

  const payload: ChatCompletionRequest = {
    model: config.model,
    group: config.group,
    messages: processedMessages,
    stream: config.stream,
  }

  // Add enabled parameters
  const parameterKeys: Array<keyof ParameterEnabled> = [
    'temperature',
    'top_p',
    'max_tokens',
    'frequency_penalty',
    'presence_penalty',
    'seed',
  ]

  parameterKeys.forEach((key) => {
    if (parameterEnabled[key]) {
      const value = config[key as keyof PlaygroundConfig]
      if (value !== undefined && value !== null) {
        ;(payload as unknown as Record<string, unknown>)[key] = value
      }
    }
  })

  // Web search
  if (config.enable_search) {
    payload.web_search_options = { search_context_size: 'medium' }
  }

  return payload
}
