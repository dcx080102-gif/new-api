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
import { useCallback } from 'react'
import { toast } from 'sonner'
import { sendChatCompletion, sendImageGeneration } from '../api'
import { MESSAGE_STATUS, ERROR_MESSAGES, API_ENDPOINTS } from '../constants'
import {
  buildChatCompletionPayload,
  updateAssistantMessageWithError,
  updateLastAssistantMessage,
  processStreamingContent,
  finalizeMessage,
  getCurrentVersion,
  isValidMessage,
} from '../lib'
import type {
  ChatCompletionResponse,
  Message,
  MessageAttachment,
  PlaygroundConfig,
  ParameterEnabled,
} from '../types'
import { useStreamRequest } from './use-stream-request'

interface UseChatHandlerOptions {
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
  onMessageUpdate: (updater: (prev: Message[]) => Message[]) => void
}

/**
 * Hook for handling chat message sending and receiving
 */
export function useChatHandler({
  config,
  parameterEnabled,
  onMessageUpdate,
}: UseChatHandlerOptions) {
  const { sendStreamRequest, stopStream, isStreaming } = useStreamRequest()

  // Handle stream update
  const handleStreamUpdate = useCallback(
    (type: 'reasoning' | 'content', chunk: string) => {
      onMessageUpdate((prev) =>
        updateLastAssistantMessage(prev, (message) => {
          if (message.status === MESSAGE_STATUS.ERROR) return message

          if (type === 'reasoning') {
            // Direct API reasoning_content
            return {
              ...message,
              reasoning: {
                content: (message.reasoning?.content || '') + chunk,
                duration: 0,
              },
              isReasoningStreaming: true,
              status: MESSAGE_STATUS.STREAMING,
            }
          }

          // Content streaming: handle <think> tags
          return {
            ...processStreamingContent(message, chunk),
            status: MESSAGE_STATUS.STREAMING,
          }
        })
      )
    },
    [onMessageUpdate]
  )

  // Handle stream complete
  const handleStreamComplete = useCallback(() => {
    onMessageUpdate((prev) =>
      updateLastAssistantMessage(prev, (message) =>
        message.status === MESSAGE_STATUS.COMPLETE ||
        message.status === MESSAGE_STATUS.ERROR
          ? message
          : { ...finalizeMessage(message), status: MESSAGE_STATUS.COMPLETE }
      )
    )
  }, [onMessageUpdate])

  // Handle stream error
  const handleStreamError = useCallback(
    (error: string, errorCode?: string) => {
      toast.error(error)
      onMessageUpdate((prev) =>
        updateAssistantMessageWithError(prev, error, errorCode)
      )
    },
    [onMessageUpdate]
  )

  // Send streaming chat request
  const sendStreamingChat = useCallback(
    (messages: Message[]) => {
      const payload = buildChatCompletionPayload(
        messages,
        config,
        parameterEnabled
      )
      sendStreamRequest(
        payload,
        handleStreamUpdate,
        handleStreamComplete,
        handleStreamError
      )
    },
    [
      config,
      parameterEnabled,
      sendStreamRequest,
      handleStreamUpdate,
      handleStreamComplete,
      handleStreamError,
    ]
  )

  // Send non-streaming chat request
  const sendNonStreamingChat = useCallback(
    async (messages: Message[]) => {
      const payload = buildChatCompletionPayload(
        messages,
        config,
        parameterEnabled
      )

      try {
        const response = await sendChatCompletion(payload)
        
        // 检测是否为生图响应（OpenAI 图片格式：{ data: [{ url: "..." }] }）
        const responseData = response as unknown as Record<string, unknown>
        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          const imageData = responseData.data[0] as Record<string, string>
          const imageUrl = imageData.url || ''
          const imageB64 = imageData.b64_json || ''
          if (imageUrl || imageB64) {
            // 真实 URL 才留在消息文本里（体积小）；base64 只存展示附件，绝不塞回后续请求
            const content = imageUrl
              ? `🖼️ **Generated Image**\n\n${imageUrl}`
              : `🖼️ **Generated Image**`
            const displayAttachments: MessageAttachment[] = imageB64
              ? [
                  {
                    type: 'image',
                    url: `data:image/png;base64,${imageB64}`,
                    name: 'generated-image.png',
                    mimeType: 'image/png',
                  },
                ]
              : []
            onMessageUpdate((prev) =>
              updateLastAssistantMessage(prev, (message) => ({
                ...finalizeMessage({
                  ...message,
                  versions: [{ ...message.versions[0], content }],
                }),
                status: MESSAGE_STATUS.COMPLETE,
                attachments: displayAttachments.length
                  ? displayAttachments
                  : message.attachments,
              }))
            )
            return
          }
        }
        
        // 检测是否为视频响应（task-based：{ task_id: "...", status: "..." }）
        const respAny = responseData as Record<string, unknown>
        if (respAny.task_id) {
          const taskId = respAny.task_id as string
          const taskStatus = (respAny.status as string) || 'processing'
          const content = `🎬 Video generation submitted\n\nTask ID: ${taskId}\nStatus: ${taskStatus}\n\nPlease wait for processing to complete.`
          onMessageUpdate((prev) =>
            updateLastAssistantMessage(prev, (message) => ({
              ...finalizeMessage({
                ...message,
                versions: [{ ...message.versions[0], content }],
              }),
              status: MESSAGE_STATUS.COMPLETE,
            }))
          )
          return
        }

        // 标准聊天响应
        const choice = (response as ChatCompletionResponse).choices?.[0]
        if (!choice) return

        onMessageUpdate((prev) =>
          updateLastAssistantMessage(prev, (message) => ({
            ...finalizeMessage(
              {
                ...message,
                versions: [
                  {
                    ...message.versions[0],
                    content: choice.message?.content || '',
                  },
                ],
              },
              choice.message?.reasoning_content
            ),
            status: MESSAGE_STATUS.COMPLETE,
          }))
        )
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: { message?: string; error?: { code?: string } }
          }
          message?: string
        }
        handleStreamError(
          err?.response?.data?.message ||
            err?.message ||
            ERROR_MESSAGES.API_REQUEST_ERROR,
          err?.response?.data?.error?.code || undefined
        )
      }
    },
    [config, parameterEnabled, onMessageUpdate, handleStreamError]
  )

  // Send image generation request (gpt-image / dall-e 等走生图端点的模型)
  // 带图片附件走 edits（图转图），否则走 generations（文生图）
  const sendImageRequest = useCallback(
    async (messages: Message[]) => {
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.from === 'user' && isValidMessage(m))
      const promptText = lastUserMessage
        ? getCurrentVersion(lastUserMessage).content
        : ''
      const imageAttachments =
        lastUserMessage?.attachments?.filter((a) => a.type === 'image') ?? []
      // 上游 4k超分 不支持图转图（edits 端点 100% 报 400），强制走文生图
      const isUpscaleModel =
        config.model?.toLowerCase().includes('4k超分') || false
      const hasImage = imageAttachments.length > 0 && !isUpscaleModel

      if (isUpscaleModel && imageAttachments.length > 0) {
        toast.info(
          '4k超分模型暂不支持上传图片，已按文字描述直接生成 4K 图片'
        )
      }

      const payload = {
        model: config.model,
        group: config.group,
        prompt: promptText.trim() || 'generate an image',
        n: 1,
        ...(hasImage ? { image: imageAttachments.map((a) => a.url) } : {}),
      }

      try {
        const response = await sendImageGeneration(
          hasImage
            ? API_ENDPOINTS.IMAGE_EDITS
            : API_ENDPOINTS.IMAGE_GENERATIONS,
          payload
        )
        const imageData = response.data?.[0] as
          | Record<string, string>
          | undefined
        const imageUrl = imageData?.url || ''
        const imageB64 = imageData?.b64_json || ''

        // 真实 URL 留在消息文本里（体积小）；base64 只存展示附件
        const content = imageUrl
          ? `🖼️ **Generated Image**\n\n${imageUrl}`
          : `🖼️ **Generated Image**`

        const displayAttachments: MessageAttachment[] = imageB64
          ? [
              {
                type: 'image',
                url: `data:image/png;base64,${imageB64}`,
                name: 'generated-image.png',
                mimeType: 'image/png',
              },
            ]
          : []

        onMessageUpdate((prev) =>
          updateLastAssistantMessage(prev, (message) => ({
            ...finalizeMessage({
              ...message,
              versions: [{ ...message.versions[0], content }],
            }),
            status: MESSAGE_STATUS.COMPLETE,
            attachments: displayAttachments.length
              ? displayAttachments
              : message.attachments,
          }))
        )
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: { message?: string; error?: { code?: string } }
          }
          message?: string
        }
        handleStreamError(
          err?.response?.data?.message ||
            err?.message ||
            ERROR_MESSAGES.API_REQUEST_ERROR,
          err?.response?.data?.error?.code || undefined
        )
      }
    },
    [config.model, config.group, onMessageUpdate, handleStreamError]
  )

  // Send chat request (stream or non-stream based on config)
  // Force non-streaming for video/image generation models
  const sendChat = useCallback(
    (messages: Message[]) => {
      const modelName = config.model?.toLowerCase() || ''
      // 生图端点模型：上游只在 /images/* 路由下提供这些模型，
      // 走 chat 会 404 "image route not found"
      const isImageEndpointModel =
        modelName.includes('gpt-image') ||
        modelName.includes('dall-e') ||
        modelName.includes('dall') ||
        modelName.includes('flux') ||
        modelName.includes('sdxl') ||
        modelName.includes('imagen') ||
        modelName.includes('midjourney')

      if (isImageEndpointModel) {
        sendImageRequest(messages)
        return
      }

      const isMediaModel = modelName.includes('video') || 
        modelName.includes('imagine') || 
        modelName.includes('image') ||
        modelName.includes('generate')
      
      if (config.stream && !isMediaModel) {
        sendStreamingChat(messages)
      } else {
        sendNonStreamingChat(messages)
      }
    },
    [config.stream, config.model, sendStreamingChat, sendNonStreamingChat, sendImageRequest]
  )

  // Stop generation
  const stopGeneration = useCallback(() => {
    stopStream()
    onMessageUpdate((prev) =>
      updateLastAssistantMessage(prev, (message) =>
        message.status === MESSAGE_STATUS.LOADING ||
        message.status === MESSAGE_STATUS.STREAMING
          ? { ...finalizeMessage(message), status: MESSAGE_STATUS.COMPLETE }
          : message
      )
    )
  }, [stopStream, onMessageUpdate])

  return {
    sendChat,
    stopGeneration,
    isGenerating: isStreaming,
  }
}
