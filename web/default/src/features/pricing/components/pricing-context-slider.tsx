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
import { Slider } from '@/components/ui/slider'
import { formatTokenCount } from '../lib/model-metadata'

/**
 * Context window presets in tokens for the slider.
 */
const CONTEXT_PRESETS = [
  0,        // Any
  8_000,    // 8K
  16_000,   // 16K
  32_000,   // 32K
  64_000,   // 64K
  128_000,  // 128K
  200_000,  // 200K
  256_000,  // 256K
  500_000,  // 500K
  1_000_000, // 1M
  2_000_000, // 2M
]

export interface ContextSliderFilterProps {
  value: number
  onChange: (value: number) => void
}

export function ContextSliderFilter(props: ContextSliderFilterProps) {
  const { t } = useTranslation()

  // Map value to slider index
  const sliderIndex = CONTEXT_PRESETS.indexOf(props.value)
  const currentIndex = sliderIndex >= 0 ? sliderIndex : 0

  const label =
    props.value <= 0
      ? t('Any')
      : t('{{size}}+ Context', {
          size: formatTokenCount(props.value),
        })

  const displayValue =
    props.value <= 0 ? t('All') : formatTokenCount(props.value)

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <span className='text-muted-foreground text-xs'>{label}</span>
        <span className='text-foreground font-mono text-xs font-semibold'>
          {displayValue}
        </span>
      </div>
      <Slider
        value={[currentIndex]}
        min={0}
        max={CONTEXT_PRESETS.length - 1}
        step={1}
        onValueChange={(
          value: number | readonly number[],
        ) => {
          const arr = Array.isArray(value) ? value : [value]
          const index = arr[0]
          if (
            index !== undefined &&
            index >= 0 &&
            index < CONTEXT_PRESETS.length
          ) {
            props.onChange(CONTEXT_PRESETS[index])
          }
        }}
      />
      <div className='flex justify-between text-muted-foreground text-[10px]'>
        <span>{t('Any')}</span>
        <span>2M</span>
      </div>
    </div>
  )
}
