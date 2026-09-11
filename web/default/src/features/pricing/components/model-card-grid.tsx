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
import { DEFAULT_TOKEN_UNIT } from '../constants'
import type { PricingModel, TokenUnit } from '../types'
import { ModelCard } from './model-card'

// ----------------------------------------------------------------------------
// 厂商分组（otter Link 定制）：Claude / GPT / DeepSeek / GLM / 千问 五组。
// （2026-09-11：分组标题旁的"倍率"徽章已移除，与上游 Drag 展示对齐）
// ----------------------------------------------------------------------------

interface VendorGroupDef {
  /** 模型名前缀匹配 */
  prefix: RegExp
  label: string
  emoji: string
}

const VENDOR_GROUPS: VendorGroupDef[] = [
  { prefix: /^(gpt-image|gemini-[\w.-]*-image)/i, label: '图形模型', emoji: '🎨' },
  { prefix: /^claude/i, label: 'Claude', emoji: '🟠' },
  { prefix: /^(gpt|codex)/i, label: 'GPT', emoji: '🟢' },
  { prefix: /^deepseek/i, label: 'DeepSeek', emoji: '🐋' },
  { prefix: /^(glm|chatglm|cogview|cogvideo)/i, label: 'GLM', emoji: '🔷' },
  { prefix: /^qwen/i, label: '千问', emoji: '🌊' },
]

export interface ModelCardGridProps {
  models: PricingModel[]
  onModelClick: (modelName: string) => void
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
}

export function ModelCardGrid(props: ModelCardGridProps) {
  const tokenUnit = props.tokenUnit ?? DEFAULT_TOKEN_UNIT

  if (props.models.length === 0) {
    return null
  }

  const renderCard = (model: PricingModel) => (
    <ModelCard
      key={model.id ?? model.model_name}
      model={model}
      tokenUnit={tokenUnit}
      priceRate={props.priceRate}
      usdExchangeRate={props.usdExchangeRate}
      showRechargePrice={props.showRechargePrice}
      onClick={() => props.onModelClick(model.model_name || '')}
    />
  )

  // 按厂商分组
  const groupModels: PricingModel[][] = VENDOR_GROUPS.map(() => [])
  const otherModels: PricingModel[] = []

  for (const model of props.models) {
    const name = model.model_name || ''
    const groupIndex = VENDOR_GROUPS.findIndex((g) => g.prefix.test(name))
    if (groupIndex >= 0) {
      groupModels[groupIndex].push(model)
    } else {
      otherModels.push(model)
    }
  }

  const hasGroups = groupModels.some((list) => list.length > 0)

  return (
    <div className='flex flex-col gap-4'>
      {VENDOR_GROUPS.map((def, index) => {
        const list = groupModels[index]
        if (list.length === 0) {
          return null
        }
        // 分组标题（倍率徽章已移除，仅保留标题与分隔线）
        return (
          <section key={def.label} className='flex flex-col gap-3'>
            <div className='flex flex-wrap items-center gap-2.5 pt-1'>
              <h3 className='shrink-0 text-sm font-bold tracking-tight'>
                {def.emoji} {def.label}
              </h3>
              <span className='bg-border h-px min-w-8 flex-1' aria-hidden='true' />
            </div>
            {list.map(renderCard)}
          </section>
        )
      })}

      {hasGroups && otherModels.length > 0 ? (
        <div className='flex items-center gap-2.5 pt-1'>
          <h3 className='shrink-0 text-sm font-bold tracking-tight'>
            🌐 其他模型
          </h3>
          <span className='bg-border h-px flex-1' aria-hidden='true' />
        </div>
      ) : null}

      {otherModels.map(renderCard)}
    </div>
  )
}
