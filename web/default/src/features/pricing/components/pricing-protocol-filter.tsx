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
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { modelMatchesProtocol } from '../lib/model-metadata'
import { PROTOCOLS, PROTOCOL_ICONS, type Protocol } from '../constants'
import type { PricingModel } from '../types'

function countByProtocol(
  models: PricingModel[],
  protocol: Protocol
): number {
  if (protocol === PROTOCOLS.ALL) return models.length
  return models.reduce(
    (count, model) => count + (modelMatchesProtocol(model, protocol) ? 1 : 0),
    0
  )
}

export interface APIProtocolFilterProps {
  value: string
  onChange: (value: string) => void
  models: PricingModel[]
}

export function APIProtocolFilter(props: APIProtocolFilterProps) {
  const { t } = useTranslation()

  const protocolOptions: Array<{
    value: string
    label: string
    iconKey?: string
    count: number
  }> = [
    {
      value: PROTOCOLS.ALL,
      label: t('All'),
      count: props.models.length,
    },
    {
      value: PROTOCOLS.OPENAI,
      label: 'OpenAI',
      iconKey: PROTOCOL_ICONS[PROTOCOLS.OPENAI],
      count: countByProtocol(props.models, PROTOCOLS.OPENAI),
    },
    {
      value: PROTOCOLS.ANTHROPIC,
      label: 'Anthropic',
      iconKey: PROTOCOL_ICONS[PROTOCOLS.ANTHROPIC],
      count: countByProtocol(props.models, PROTOCOLS.ANTHROPIC),
    },
    {
      value: PROTOCOLS.GEMINI,
      label: 'Gemini',
      iconKey: PROTOCOL_ICONS[PROTOCOLS.GEMINI],
      count: countByProtocol(props.models, PROTOCOLS.GEMINI),
    },
  ]

  return (
    <div className='flex flex-wrap gap-1.5'>
      {protocolOptions.map((option) => (
        <button
          key={option.value}
          type='button'
          onClick={() => props.onChange(option.value)}
          className={`
            group inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-all
            ${
              props.value === option.value
                ? 'border-foreground/30 bg-foreground/5 text-foreground shadow-sm'
                : 'border-border/70 bg-background text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground'
            }
          `}
          title={option.label}
        >
          {option.iconKey && (
            <span className='shrink-0'>
              {getLobeIcon(option.iconKey, 14)}
            </span>
          )}
          <span className='truncate'>{option.label}</span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] ${
              props.value === option.value
                ? 'bg-background text-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {option.count}
          </span>
        </button>
      ))}
    </div>
  )
}
