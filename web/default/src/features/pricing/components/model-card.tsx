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
import { memo, useMemo, useState } from 'react'
import { Copy, CopyCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { DEFAULT_TOKEN_UNIT, MAX_TAGS_DISPLAY } from '../constants'
import { isTokenBasedModel, normalizeModelName, getModelBrandIconKey } from '../lib/model-helpers'
import { formatPrice, formatRequestPrice } from '../lib/price'
import {
  inferModelMetadata,
  formatTokenCount,
  formatYearMonth,
  getCapabilityI18nKey,
  getDisplayCapabilities,
} from '../lib/model-metadata'
import type { PricingModel, TokenUnit } from '../types'

export interface ModelCardProps {
  model: PricingModel
  onClick: () => void
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
}

/** Map endpoint type to a short protocol label for badges. */
const PROTOCOL_BADGES: Record<string, { label: string; order: number }> = {
  openai: { label: 'OpenAI', order: 1 },
  'openai-response': { label: 'Response', order: 2 },
  anthropic: { label: 'Anthropic', order: 3 },
  gemini: { label: 'Gemini', order: 4 },
  'image-generation': { label: '图片', order: 5 },
  embeddings: { label: '嵌入', order: 6 },
  'jina-rerank': { label: 'Rerank', order: 7 },
  'openai-video': { label: '视频', order: 8 },
}

function getProtocolBadges(endpoints?: string[]) {
  if (!endpoints || endpoints.length === 0) return []
  return endpoints
    .filter((e) => PROTOCOL_BADGES[e])
    .map((e) => ({
      key: e,
      ...PROTOCOL_BADGES[e],
    }))
    .sort((a, b) => a.order - b.order)
}

/** Check if model is deprecated (empty enable_groups means offline). */
function isDeprecated(model: PricingModel): boolean {
  return !model.enable_groups || model.enable_groups.length === 0
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

  // Compute metadata once per model
  const metadata = useMemo(
    () => inferModelMetadata(props.model),
    [props.model]
  )

  const displayResult = useMemo(
    () => getDisplayCapabilities(metadata.capabilities, MAX_TAGS_DISPLAY),
    [metadata.capabilities]
  )

  const displayCapabilities = displayResult.displayed
  const overflowCount = displayResult.total - displayResult.displayed.length

  // Cache pricing
  const hasCacheRead =
    isTokenBased &&
    props.model.cache_ratio != null &&
    Number.isFinite(Number(props.model.cache_ratio))
  const cacheReadPrice = hasCacheRead
    ? formatPrice(
        props.model,
        'cache',
        tokenUnit,
        showRechargePrice,
        priceRate,
        usdExchangeRate
      )
    : null

  const hasCacheWrite =
    isTokenBased &&
    props.model.create_cache_ratio != null &&
    Number.isFinite(Number(props.model.create_cache_ratio))
  const cacheWritePrice = hasCacheWrite
    ? formatPrice(
        props.model,
        'create_cache',
        tokenUnit,
        showRechargePrice,
        priceRate,
        usdExchangeRate
      )
    : null

  // Vendor icon
  const modelIconKey =
    getModelBrandIconKey(props.model.model_name || '') ||
    props.model.icon ||
    props.model.vendor_icon
  const modelIcon = modelIconKey ? getLobeIcon(modelIconKey, 24) : null
  const initial = props.model.model_name?.charAt(0).toUpperCase() || '?'

  const modelName = props.model.model_name || ''
  const displayName = normalizeModelName(modelName)
  const deprecated = isDeprecated(props.model)

  // Protocol badges for this model
  const protocolBadges = useMemo(
    () => getProtocolBadges(props.model.supported_endpoint_types),
    [props.model.supported_endpoint_types]
  )

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    copyToClipboard(modelName)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Check if any metadata is worth showing
  const hasContext = metadata.context_length > 0
  const hasMaxOutput = metadata.max_output_tokens > 0
  const hasReleaseDate = !!metadata.release_date
  const hasAnyParams = hasContext || hasMaxOutput

  return (
    <div
      className={cn(
        'w-full rounded-xl border bg-card p-4 cursor-pointer transition-all',
        'hover:border-primary/40 hover:bg-primary/[0.02] hover:-translate-y-1 hover:shadow-lg',
        'dark:bg-card dark:hover:border-primary/40',
        deprecated && 'opacity-60 hover:opacity-80'
      )}
      onClick={() => {
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
      {/* ── Row 1: Icon + Vendor:Name + Protocol badges + Release date ── */}
      <div className='flex items-center gap-2.5 flex-wrap'>
        <div className='bg-muted/50 flex size-8 shrink-0 items-center justify-center rounded-lg'>
          {modelIcon || (
            <span className='text-muted-foreground text-sm font-bold'>
              {initial}
            </span>
          )}
        </div>
        <h3 className='font-semibold text-sm truncate max-w-[220px]'>
          {props.model.vendor_name && (
            <span className='text-muted-foreground font-normal'>
              {props.model.vendor_name}:{' '}
            </span>
          )}
          {displayName}
        </h3>

        {/* Protocol badges */}
        {protocolBadges.length > 0 && (
          <div className='flex items-center gap-1'>
            {protocolBadges.map((pb) => (
              <span
                key={pb.key}
                className='rounded border border-border/60 bg-muted/30 px-1.5 py-px text-[10px] text-muted-foreground leading-none'
              >
                {pb.label}
              </span>
            ))}
          </div>
        )}

        <div className='flex-1' />

        {/* Status badges */}
        {deprecated && (
          <span className='rounded bg-destructive/10 px-1.5 py-px text-[10px] text-destructive leading-none'>
            {t('Deprecated')}
          </span>
        )}

        {hasReleaseDate && (
          <span className='text-[11px] text-muted-foreground/50'>
            {formatYearMonth(metadata.release_date)}
          </span>
        )}
      </div>

      {/* ── Row 2: Model ID (monospace) + Copy + Params ── */}
      <div className='flex items-center gap-2 text-xs text-muted-foreground mt-2'>
        <code className='text-[11px] font-mono'>{modelName}</code>
        <button
          type='button'
          onClick={handleCopy}
          className={cn(
            'shrink-0 rounded p-0.5 transition-colors',
            'hover:bg-muted/50',
            copied
              ? 'text-green-600 dark:text-green-400'
              : 'text-muted-foreground/50 hover:text-muted-foreground'
          )}
          title={t('Copy model name')}
        >
          {copied ? (
            <CopyCheck className='size-3.5' />
          ) : (
            <Copy className='size-3.5' />
          )}
        </button>
        {hasAnyParams && (
          <>
            <div className='flex-1' />
            {hasContext && (
              <span className='inline-flex items-center gap-1'>
                <span className='font-medium text-foreground/70'>
                  {t('Context')}
                </span>
                <span className='tabular-nums'>
                  {formatTokenCount(metadata.context_length)}
                </span>
              </span>
            )}
            {hasMaxOutput && (
              <>
                <span className='text-muted-foreground/30'>·</span>
                <span className='inline-flex items-center gap-1'>
                  <span className='font-medium text-foreground/70'>
                    {t('Max Output')}
                  </span>
                  <span className='tabular-nums'>
                    {formatTokenCount(metadata.max_output_tokens)}
                  </span>
                </span>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Row 3: Price (Input / Output inline) ── */}
      {isTokenBased ? (
        <div className='flex items-baseline gap-x-3 text-sm mt-2.5'>
          <span className='inline-flex items-baseline gap-1'>
            <span className='text-muted-foreground text-xs'>{t('Input')}</span>
            <span className='text-foreground font-mono font-semibold text-sm'>
              {formatPrice(
                props.model,
                'input',
                tokenUnit,
                showRechargePrice,
                priceRate,
                usdExchangeRate
              )}
            </span>
            <span className='text-muted-foreground/50 text-[10px]'>
              /{tokenUnitLabel}
            </span>
          </span>
          <span className='text-muted-foreground/30 text-xs'>·</span>
          <span className='inline-flex items-baseline gap-1'>
            <span className='text-muted-foreground text-xs'>
              {t('Output')}
            </span>
            <span className='text-foreground font-mono font-semibold text-sm'>
              {formatPrice(
                props.model,
                'output',
                tokenUnit,
                showRechargePrice,
                priceRate,
                usdExchangeRate
              )}
            </span>
            <span className='text-muted-foreground/50 text-[10px]'>
              /{tokenUnitLabel}
            </span>
          </span>
        </div>
      ) : (
        <div className='flex items-baseline gap-x-3 text-sm mt-2.5'>
          <span className='inline-flex items-baseline gap-1'>
            <span className='text-muted-foreground text-xs'>{t('Price')}</span>
            <span className='text-foreground font-mono font-semibold text-sm'>
              {formatRequestPrice(
                props.model,
                showRechargePrice,
                priceRate,
                usdExchangeRate
              )}
            </span>
          </span>
        </div>
      )}

      {/* ── Row 4: Cache pricing (if applicable) ── */}
      {(cacheReadPrice || cacheWritePrice) && (
        <div className='flex items-baseline gap-x-3 text-sm mt-1.5'>
          {cacheReadPrice && cacheReadPrice !== '-' && (
            <span className='inline-flex items-baseline gap-1'>
              <span className='text-muted-foreground text-xs'>
                {t('Cache Read')}
              </span>
              <span className='text-muted-foreground font-mono font-medium text-xs'>
                {cacheReadPrice}
              </span>
              <span className='text-muted-foreground/50 text-[10px]'>
                /{tokenUnitLabel}
              </span>
            </span>
          )}
          {cacheWritePrice && cacheWritePrice !== '-' && (
            <>
              {cacheReadPrice && (
                <span className='text-muted-foreground/30 text-xs'>·</span>
              )}
              <span className='inline-flex items-baseline gap-1'>
                <span className='text-muted-foreground text-xs'>
                  {t('Cache Write')}
                </span>
                <span className='text-muted-foreground font-mono font-medium text-xs'>
                  {cacheWritePrice}
                </span>
                <span className='text-muted-foreground/50 text-[10px]'>
                  /{tokenUnitLabel}
                </span>
              </span>
            </>
          )}
        </div>
      )}

      {/* ── Row 5: Capability tags ── */}
      {displayCapabilities.length > 0 && (
        <div className='flex flex-wrap items-center gap-1 mt-2.5'>
          {displayCapabilities.map((cap) => (
            <span
              key={cap}
              className='rounded-md bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground leading-none'
            >
              {t(getCapabilityI18nKey(cap))}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className='rounded-md bg-muted/30 px-1.5 py-0.5 text-[11px] text-muted-foreground/60 leading-none'>
              {t('+{{n}} more', { n: overflowCount })}
            </span>
          )}
        </div>
      )}
    </div>
  )
})
