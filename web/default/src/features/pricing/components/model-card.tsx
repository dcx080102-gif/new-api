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
import { memo, useState } from 'react'
import { Copy, CopyCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { DEFAULT_TOKEN_UNIT } from '../constants'
import { isTokenBasedModel } from '../lib/model-helpers'
import { formatPrice } from '../lib/price'
import type { PricingModel, TokenUnit } from '../types'

export interface ModelCardProps {
  model: PricingModel
  onClick: () => void
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
}

export const ModelCard = memo(function ModelCard(props: ModelCardProps) {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()
  const user = useAuthStore((s) => s.auth.user)

  const [copied, setCopied] = useState(false)

  const tokenUnit = props.tokenUnit ?? DEFAULT_TOKEN_UNIT
  const priceRate = props.priceRate ?? 1
  const usdExchangeRate = props.usdExchangeRate ?? 1
  const showRechargePrice = props.showRechargePrice ?? false

  const isTokenBased = isTokenBasedModel(props.model)
  const tokenUnitLabel = tokenUnit === 'K' ? '1K' : '1M'

  // Vendor icon
  const modelIconKey = props.model.icon || props.model.vendor_icon
  const modelIcon = modelIconKey
    ? getLobeIcon(modelIconKey, 24)
    : null
  const initial = props.model.model_name?.charAt(0).toUpperCase() || '?'

  // Render tags from endpoint types + context
  const endpoints = props.model.supported_endpoint_types || []
  const displayTags: string[] = [...endpoints.slice(0, 3)]

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    const name = props.model.model_name || ''
    copyToClipboard(name)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div
        className={cn(
          'group relative flex cursor-pointer flex-col rounded-xl border bg-card p-4 transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-lg hover:border-primary/30',
          'dark:bg-card dark:hover:border-primary/40'
        )}
        onClick={(e) => {
          if (!user) {
            window.location.href = '/sign-in'
            return
          }
          props.onClick()
        }}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            props.onClick()
          }
        }}
      >
        {/* Header: Vendor icon + vendor name */}
        <div className='flex items-center gap-2.5 mb-3'>
          <div className='bg-muted/50 flex size-8 shrink-0 items-center justify-center rounded-lg'>
            {modelIcon || (
              <span className='text-muted-foreground text-sm font-bold'>
                {initial}
              </span>
            )}
          </div>
          <span className='text-muted-foreground truncate text-sm font-medium'>
            {props.model.vendor_name || t('Unknown Vendor')}
          </span>
        </div>

        {/* Model name */}
        <h3 className='text-foreground truncate font-semibold text-base mb-2'>
          {props.model.model_name}
        </h3>

        {/* Tags: endpoint types */}
        {displayTags.length > 0 && (
          <div className='flex flex-wrap gap-1.5 mb-3'>
            {displayTags.map((tag) => (
              <span
                key={tag}
                className='text-muted-foreground bg-muted/40 rounded-md px-2 py-0.5 text-xs'
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className='border-t border-border/60 my-2' />

        {/* Prices */}
        <div className='space-y-1 mb-3'>
          {isTokenBased ? (
            <>
              <div className='flex items-baseline justify-between text-sm'>
                <span className='text-muted-foreground'>
                  {t('Input')}
                </span>
                <span className='text-foreground font-mono font-semibold'>
                  {formatPrice(
                    props.model,
                    'input',
                    tokenUnit,
                    showRechargePrice,
                    priceRate,
                    usdExchangeRate
                  )}
                  <span className='text-muted-foreground/60 font-normal text-xs'>
                    {' / '}
                    {tokenUnitLabel} tokens
                  </span>
                </span>
              </div>
              <div className='flex items-baseline justify-between text-sm'>
                <span className='text-muted-foreground'>
                  {t('Output')}
                </span>
                <span className='text-foreground font-mono font-semibold'>
                  {formatPrice(
                    props.model,
                    'output',
                    tokenUnit,
                    showRechargePrice,
                    priceRate,
                    usdExchangeRate
                  )}
                  <span className='text-muted-foreground/60 font-normal text-xs'>
                    {' / '}
                    {tokenUnitLabel} tokens
                  </span>
                </span>
              </div>
            </>
          ) : (
            <div className='flex items-baseline justify-between text-sm'>
              <span className='text-muted-foreground'>{t('Price')}</span>
              <span className='text-foreground font-mono font-semibold'>
                {formatPrice(
                  props.model,
                  'input',
                  tokenUnit,
                  showRechargePrice,
                  priceRate,
                  usdExchangeRate
                )}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className='border-t border-border/60 my-2' />

        {/* Actions: Copy model name */}
        <div className='flex items-center gap-2'>
          {/* Copy button */}
          <button
            type='button'
            onClick={handleCopy}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200',
              'hover:bg-muted/50 hover:border-primary/40',
              copied
                ? 'border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/20'
                : 'text-muted-foreground'
            )}
          >
            {copied ? (
              <CopyCheck className='size-3.5' />
            ) : (
              <Copy className='size-3.5' />
            )}
            {copied ? t('Copied') : t('Copy')}
          </button>
        </div>
      </div>
    </>
  )
})
