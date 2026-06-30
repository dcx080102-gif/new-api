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
import { useRef, useState } from 'react'
import {
  PaperclipIcon,
  FileIcon,
  ImageIcon,
  ScreenShareIcon,
  CameraIcon,
  GlobeIcon,
  SendIcon,
  SquareIcon,
  BarChartIcon,
  BoxIcon,
  NotepadTextIcon,
  CodeSquareIcon,
  GraduationCapIcon,
  XIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { ModelGroupSelector } from '@/components/model-group-selector'
import type { MessageAttachment, ModelOption, GroupOption } from '../types'

interface PlaygroundInputProps {
  onSubmit: (text: string, attachments?: MessageAttachment[]) => void
  onStop?: () => void
  disabled?: boolean
  isGenerating?: boolean
  models: ModelOption[]
  modelValue: string
  onModelChange: (value: string) => void
  isModelLoading?: boolean
  groups: GroupOption[]
  groupValue: string
  onGroupChange: (value: string) => void
}

const suggestions = [
  { icon: BarChartIcon, text: 'Analyze data', color: '#76d0eb' },
  { icon: BoxIcon, text: 'Surprise me', color: '#76d0eb' },
  { icon: NotepadTextIcon, text: 'Summarize text', color: '#ea8444' },
  { icon: CodeSquareIcon, text: 'Code', color: '#6c71ff' },
  { icon: GraduationCapIcon, text: 'Get advice', color: '#76d0eb' },
  { icon: null, text: 'More' },
]

/** Convert a File to a base64 data URL */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/** Capture a MediaStream track as a base64 image */
function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth || 640
  canvas.height = video.videoHeight || 480
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}

export function PlaygroundInput({
  onSubmit,
  onStop,
  disabled,
  isGenerating,
  models,
  modelValue,
  onModelChange,
  isModelLoading = false,
  groups,
  groupValue,
  onGroupChange,
}: PlaygroundInputProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const cameraVideoRef = useRef<HTMLVideoElement>(null)

  const isModelSelectDisabled =
    disabled || isModelLoading || models.length === 0
  const isGroupSelectDisabled = disabled || groups.length === 0

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim() || disabled) return
    if (attachments.length > 0) {
      onSubmit(message.text, attachments)
      setAttachments([])
    } else {
      onSubmit(message.text)
    }
    setText('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSubmit(suggestion)
  }

  // --- File upload ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    try {
      const newAttachments: MessageAttachment[] = []
      for (const file of Array.from(files)) {
        const url = await fileToDataUrl(file)
        newAttachments.push({
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url,
          name: file.name,
          mimeType: file.type,
        })
      }
      setAttachments((prev) => [...prev, ...newAttachments])
      toast.success(t('{{count}} file(s) attached', { count: files.length }))
    } catch {
      toast.error(t('Failed to attach file'))
    }
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleUploadFile = () => fileInputRef.current?.click()
  const handleUploadPhoto = () => imageInputRef.current?.click()

  // --- Screenshot ---
  const handleScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'never' } as MediaTrackConstraints,
      })
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()

      // Wait a frame for the video to render
      await new Promise((r) => setTimeout(r, 200))

      const dataUrl = captureFrame(video)
      stream.getTracks().forEach((t) => t.stop())

      if (!dataUrl) {
        toast.error(t('Failed to capture screenshot'))
        return
      }

      setAttachments((prev) => [
        ...prev,
        {
          type: 'image',
          url: dataUrl,
          name: `screenshot-${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
        },
      ])
      toast.success(t('Screenshot captured'))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      toast.error(t('Screenshot cancelled or not supported'))
    }
  }

  // --- Camera ---
  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      setCameraStream(stream)
      setShowCamera(true)

      // Wait for video element to mount then play
      requestAnimationFrame(async () => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream
          await cameraVideoRef.current.play()
        }
      })
    } catch {
      toast.error(t('Camera not available or permission denied'))
    }
  }

  const handleCapturePhoto = () => {
    if (!cameraVideoRef.current) return
    const dataUrl = captureFrame(cameraVideoRef.current)
    if (!dataUrl) return

    setAttachments((prev) => [
      ...prev,
      {
        type: 'image',
        url: dataUrl,
        name: `photo-${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
      },
    ])
    handleCloseCamera()
    toast.success(t('Photo captured'))
  }

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
  }

  // --- Remove attachment ---
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className='grid shrink-0 gap-4 px-1 md:pb-4'>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type='file'
        className='hidden'
        multiple
        accept='*/*'
        onChange={handleFileChange}
      />
      <input
        ref={imageInputRef}
        type='file'
        className='hidden'
        multiple
        accept='image/*'
        onChange={handleFileChange}
      />

      {/* Camera modal */}
      {showCamera && (
        <div className='bg-background/95 fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 backdrop-blur'>
          <video
            ref={cameraVideoRef}
            className='max-h-[70vh] max-w-full rounded-xl shadow-lg'
            autoPlay
            playsInline
            muted
          />
          <div className='flex gap-3'>
            <button
              type='button'
              onClick={handleCapturePhoto}
              className='bg-foreground size-16 rounded-full shadow-lg hover:scale-105 transition-transform'
              aria-label={t('Capture')}
            />
            <button
              type='button'
              onClick={handleCloseCamera}
              className='bg-muted text-foreground flex size-10 items-center justify-center rounded-full shadow-lg'
              aria-label={t('Close')}
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className='flex flex-wrap gap-2 px-1'>
          {attachments.map((att, i) => (
            <div
              key={`${att.name}-${i}`}
              className='bg-muted relative flex items-center gap-1.5 rounded-lg border px-2 py-1 pr-1 text-xs'
            >
              {att.type === 'image' ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className='size-8 rounded object-cover'
                />
              ) : (
                <FileIcon size={14} className='text-muted-foreground' />
              )}
              <span className='text-muted-foreground max-w-24 truncate'>
                {att.name}
              </span>
              <button
                type='button'
                onClick={() => handleRemoveAttachment(i)}
                className='text-muted-foreground hover:text-foreground ml-0.5 rounded p-0.5 transition-colors'
                aria-label={t('Remove')}
              >
                <XIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <PromptInput groupClassName='rounded-xl' onSubmit={handleSubmit}>
        <PromptInputTextarea
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck={false}
          className='px-5 md:text-base'
          disabled={disabled}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('Ask anything')}
          value={text}
        />

        <PromptInputFooter className='p-2.5'>
          <PromptInputTools>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <PromptInputButton
                    className='border font-medium'
                    disabled={disabled}
                    variant='outline'
                  />
                }
              >
                <PaperclipIcon size={16} />
                <span className='hidden sm:inline'>{t('Attach')}</span>
                <span className='sr-only sm:hidden'>{t('Attach')}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem onClick={handleUploadFile}>
                  <FileIcon className='mr-2' size={16} />
                  {t('Upload file')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUploadPhoto}>
                  <ImageIcon className='mr-2' size={16} />
                  {t('Upload photo')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleScreenshot}>
                  <ScreenShareIcon className='mr-2' size={16} />
                  {t('Take screenshot')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTakePhoto}>
                  <CameraIcon className='mr-2' size={16} />
                  {t('Take photo')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <PromptInputButton
              className='border font-medium'
              disabled={disabled}
              onClick={() => toast.info(t('Search feature in development'))}
              variant='outline'
            >
              <GlobeIcon size={16} />
              <span className='hidden sm:inline'>{t('Search')}</span>
              <span className='sr-only sm:hidden'>{t('Search')}</span>
            </PromptInputButton>
          </PromptInputTools>

          <div className='flex items-center gap-1.5 md:gap-2'>
            <ModelGroupSelector
              selectedModel={modelValue}
              models={models}
              onModelChange={onModelChange}
              selectedGroup={groupValue}
              groups={groups}
              onGroupChange={onGroupChange}
              disabled={isModelSelectDisabled || isGroupSelectDisabled}
            />

            {isGenerating && onStop ? (
              <PromptInputButton
                className='text-foreground font-medium'
                onClick={onStop}
                variant='secondary'
              >
                <SquareIcon className='fill-current' size={16} />
                <span className='hidden sm:inline'>{t('Stop')}</span>
                <span className='sr-only sm:hidden'>{t('Stop')}</span>
              </PromptInputButton>
            ) : (
              <PromptInputButton
                className='text-foreground font-medium'
                disabled={disabled || !text.trim()}
                type='submit'
                variant='secondary'
              >
                <SendIcon size={16} />
                <span className='hidden sm:inline'>{t('Send')}</span>
                <span className='sr-only sm:hidden'>{t('Send')}</span>
              </PromptInputButton>
            )}
          </div>
        </PromptInputFooter>
      </PromptInput>

      <Suggestions>
        {suggestions.map(({ icon: Icon, text, color }) => (
          <Suggestion
            className={`text-xs font-normal sm:text-sm ${
              text === 'More' ? 'hidden sm:flex' : ''
            }`}
            key={text}
            onClick={() => handleSuggestionClick(text)}
            suggestion={text}
          >
            {Icon && <Icon size={16} style={{ color }} />}
            {text}
          </Suggestion>
        ))}
      </Suggestions>
    </div>
  )
}
