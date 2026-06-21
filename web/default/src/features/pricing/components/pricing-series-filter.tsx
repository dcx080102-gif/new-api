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
import {
  MODEL_SERIES,
  MODEL_SERIES_ICONS,
  type ModelSeries,
} from '../constants'
import type { PricingModel } from '../types'

function countBySeries(
  models: PricingModel[],
  series: ModelSeries
): number {
  return models.reduce((count, model) => {
    const name = (model.model_name || '').toLowerCase()
    switch (series) {
      case MODEL_SERIES.GPT:
        return count + (name.includes('gpt') ? 1 : 0)
      case MODEL_SERIES.CLAUDE:
        return count + (name.includes('claude') ? 1 : 0)
      case MODEL_SERIES.GEMINI:
        return count + (name.includes('gemini') ? 1 : 0)
      case MODEL_SERIES.DEEPSEEK:
        return count + (name.includes('deepseek') ? 1 : 0)
      case MODEL_SERIES.QWEN:
        return count + (name.includes('qwen') ? 1 : 0)
      default:
        return count
    }
  }, 0)
}

export interface ModelSeriesFilterProps {
  value: string
  onChange: (value: string) => void
  models: PricingModel[]
}

export function ModelSeriesFilter(props: ModelSeriesFilterProps) {
  const { t } = useTranslation()

  const seriesOptions: Array<{
    value: string
    label: string
    iconKey?: string
    count: number
  }> = [
    {
      value: MODEL_SERIES.ALL,
      label: t('All'),
      count: props.models.length,
    },
    {
      value: MODEL_SERIES.GPT,
      label: 'GPT',
      iconKey: MODEL_SERIES_ICONS[MODEL_SERIES.GPT],
      count: countBySeries(props.models, MODEL_SERIES.GPT),
    },
    {
      value: MODEL_SERIES.CLAUDE,
      label: 'Claude',
      iconKey: MODEL_SERIES_ICONS[MODEL_SERIES.CLAUDE],
      count: countBySeries(props.models, MODEL_SERIES.CLAUDE),
    },
    {
      value: MODEL_SERIES.GEMINI,
      label: 'Gemini',
      iconKey: MODEL_SERIES_ICONS[MODEL_SERIES.GEMINI],
      count: countBySeries(props.models, MODEL_SERIES.GEMINI),
    },
    {
      value: MODEL_SERIES.DEEPSEEK,
      label: 'DeepSeek',
      iconKey: MODEL_SERIES_ICONS[MODEL_SERIES.DEEPSEEK],
      count: countBySeries(props.models, MODEL_SERIES.DEEPSEEK),
    },
    {
      value: MODEL_SERIES.QWEN,
      label: 'Qwen',
      iconKey: MODEL_SERIES_ICONS[MODEL_SERIES.QWEN],
      count: countBySeries(props.models, MODEL_SERIES.QWEN),
    },
  ]

  return (
    <div className='flex flex-wrap gap-1.5'>
      {seriesOptions.map((option) => (
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
