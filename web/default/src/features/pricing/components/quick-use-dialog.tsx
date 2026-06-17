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
import { useState, useEffect, useCallback } from 'react'
import { Copy, CopyCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { getApiKeys, fetchTokenKey } from '@/features/keys/api'
import { API_KEY_STATUS } from '@/features/keys/constants'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PricingModel } from '../types'

export interface QuickUseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  model: PricingModel
}

export function QuickUseDialog(props: QuickUseDialogProps) {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loadingKey, setLoadingKey] = useState(true)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)

  const modelName = props.model.model_name || ''
  const baseUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/v1` : ''

  // Fetch user's active API key when dialog opens
  useEffect(() => {
    if (!props.open) return
    let cancelled = false

    async function loadKey() {
      setLoadingKey(true)
      try {
        const result = await getApiKeys({ p: 1, size: 50 })
        if (!result.success) return
        const items = result.data?.items ?? []
        const active = items.find(
          (item) => item.status === API_KEY_STATUS.ENABLED
        )
        if (!active) return
        const keyResult = await fetchTokenKey(active.id)
        if (!cancelled && keyResult.success && keyResult.data?.key) {
          setApiKey(`sk-${keyResult.data.key}`)
        }
      } catch {
        // Silently fail — the UI shows a fallback message
      } finally {
        if (!cancelled) setLoadingKey(false)
      }
    }

    loadKey()
    return () => {
      cancelled = true
    }
  }, [props.open])

  const authValue = apiKey || 'sk-xxx'
  const curlCommand =
    `curl ${baseUrl}/chat/completions \\\n` +
    `  -H "Content-Type: application/json" \\\n` +
    `  -H "Authorization: Bearer ${authValue} \\\n` +
    `  -d '{\n` +
    `    "model": "${modelName}",\n` +
    `    "messages": [{"role": "user", "content": "Hello!"}]\n` +
    `  }'`

  const handleCopyKey = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!apiKey) return
      copyToClipboard(apiKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    },
    [apiKey, copyToClipboard]
  )

  const handleCopyCurl = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      copyToClipboard(curlCommand)
      setCopiedCurl(true)
      setTimeout(() => setCopiedCurl(false), 2000)
    },
    [curlCommand, copyToClipboard]
  )

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {t('Use')} {modelName}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* API Key */}
          <div>
            <label className='text-muted-foreground text-xs font-medium'>
              {t('API Key')}
            </label>
            <div className='bg-muted/50 mt-1 break-all rounded-lg border p-2.5 font-mono text-xs'>
              {loadingKey ? (
                <span className='text-muted-foreground'>
                  {t('Loading...')}
                </span>
              ) : apiKey ? (
                apiKey
              ) : (
                <span className='text-muted-foreground'>
                  {t(
                    'No API key available. Please create one in Console.'
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className='text-muted-foreground text-xs font-medium'>
              {t('Base URL')}
            </label>
            <div className='bg-muted/50 mt-1 rounded-lg border p-2.5 font-mono text-xs'>
              {baseUrl}
            </div>
          </div>

          {/* Divider */}
          <div className='border-t border-border/60' />

          {/* cURL Example */}
          <div>
            <label className='text-muted-foreground text-xs font-medium'>
              {t('cURL Example')}
            </label>
            <pre className='bg-muted/50 mt-1 overflow-x-auto rounded-lg border p-2.5 font-mono text-xs leading-relaxed whitespace-pre'>
              {curlCommand}
            </pre>
          </div>

          {/* Action buttons */}
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={handleCopyKey}
              disabled={!apiKey}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                'hover:bg-muted/50 hover:border-primary/40',
                copiedKey
                  ? 'border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/20'
                  : 'text-muted-foreground',
                !apiKey && 'opacity-40 cursor-not-allowed'
              )}
            >
              {copiedKey ? (
                <CopyCheck className='size-3.5' />
              ) : (
                <Copy className='size-3.5' />
              )}
              {t('Copy Key')}
            </button>
            <button
              type='button'
              onClick={handleCopyCurl}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                'hover:bg-muted/50 hover:border-primary/40',
                copiedCurl
                  ? 'border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/20'
                  : 'text-muted-foreground'
              )}
            >
              {copiedCurl ? (
                <CopyCheck className='size-3.5' />
              ) : (
                <Copy className='size-3.5' />
              )}
              {t('Copy Full Command')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
