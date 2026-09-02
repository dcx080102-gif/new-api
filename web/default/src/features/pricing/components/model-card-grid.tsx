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
// 厂商分组（otter Link 定制）：Claude / GPT / DeepSeek / GLM / 千问 五组，
// 每组标题后标注该组模型的收费倍率（去重，免费模型显示"免费"）。
// 倍率从模型数据动态读取，修改定价后自动跟随。
// ----------------------------------------------------------------------------

interface VendorGroupDef {
  /** 模型名前缀匹配 */
  prefix: RegExp
  label: string
  emoji: string
}

const VENDOR_GROUPS: VendorGroupDef[] = [
  { prefix: /^claude/i, label: 'Claude', emoji: '🟠' },
  { prefix: /^(gpt|codex)/i, label: 'GPT', emoji: '🟢' },
  { prefix: /^deepseek/i, label: 'DeepSeek', emoji: '🐋' },
  { prefix: /^(glm|chatglm|cogview|cogvideo)/i, label: 'GLM', emoji: '🔷' },
  { prefix: /^qwen/i, label: '千问', emoji: '🌊' },
]

function formatRatioLabel(ratio: number): string {
  return ratio === 0 ? '免费' : `${ratio}x`
}

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
        // 组内倍率去重并排序（大→小，免费排最后）
        const ratios = [...new Set(list.map((m) => m.model_ratio ?? 0))]
        ratios.sort((a, b) => (b === 0 ? -1 : a === 0 ? 1 : b - a))
        const ratioLabel = ratios.map(formatRatioLabel).join(' / ')
        return (
          <section key={def.label} className='flex flex-col gap-3'>
            {/* 分组标题 + 收费倍率 */}
            <div className='flex flex-wrap items-center gap-2.5 pt-1'>
              <h3 className='shrink-0 text-sm font-bold tracking-tight'>
                {def.emoji} {def.label}
              </h3>
              <span className='shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary dark:bg-primary/15'>
                倍率 {ratioLabel}
              </span>
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
