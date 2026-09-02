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
// 档位分组（otter Link 定制）：GPT 按收费倍率分三档；Claude 按产品线前缀分档。
// 档位标题后标注收费倍率（组内倍率统一时显示数字，混合时显示"按模型计价"）。
// 倍率从模型数据动态读取，修改定价后自动跟随。
// ----------------------------------------------------------------------------

type TierFamily = 'gpt' | 'claude'

interface ModelTierDef {
  family: TierFamily
  /** GPT 用：与 model_ratio 精确匹配 */
  ratio?: number
  /** Claude 用：模型名前缀匹配 */
  prefix?: string
  label: string
  emoji: string
}

const TIER_DEFS: ModelTierDef[] = [
  { family: 'gpt', ratio: 0.55, label: '旗舰档', emoji: '🏆' },
  { family: 'gpt', ratio: 0.3425, label: '主力档', emoji: '💪' },
  { family: 'gpt', ratio: 0.25, label: '轻量档', emoji: '🪶' },
  { family: 'claude', prefix: 'claude-opus', label: 'Opus 档', emoji: '🥇' },
  { family: 'claude', prefix: 'claude-sonnet', label: 'Sonnet 档', emoji: '🥈' },
  { family: 'claude', prefix: 'claude-haiku', label: 'Haiku 档', emoji: '🥉' },
  { family: 'claude', prefix: 'claude-fable', label: 'Fable 档', emoji: '✨' },
]

function getTierFamily(modelName: string): TierFamily | null {
  if (/^(gpt|codex)/i.test(modelName)) return 'gpt'
  if (/^claude/i.test(modelName)) return 'claude'
  return null
}

function formatRatioLabel(ratio: number): string {
  return `${ratio}`
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

  // 按档位分组：系列 + 匹配规则命中 → 分组；其余 → 保持原样
  const tierModels: PricingModel[][] = TIER_DEFS.map(() => [])
  const otherModels: PricingModel[] = []

  for (const model of props.models) {
    const name = model.model_name || ''
    const family = getTierFamily(name)
    if (!family) {
      otherModels.push(model)
      continue
    }
    const tierIndex = TIER_DEFS.findIndex((def) => {
      if (def.family !== family) return false
      if (family === 'claude') {
        return def.prefix ? name.toLowerCase().startsWith(def.prefix) : false
      }
      return def.ratio !== undefined && def.ratio === model.model_ratio
    })
    if (tierIndex >= 0) {
      tierModels[tierIndex].push(model)
    } else {
      otherModels.push(model)
    }
  }

  const hasTierGroups = tierModels.some((list) => list.length > 0)

  return (
    <div className='flex flex-col gap-4'>
      {TIER_DEFS.map((def, index) => {
        const list = tierModels[index]
        if (list.length === 0) {
          return null
        }
        // 组内倍率统一 → 显示数字；混合 → 按模型计价
        const ratios = new Set(list.map((m) => m.model_ratio))
        const ratioLabel =
          ratios.size === 1 ? `${formatRatioLabel(list[0].model_ratio)}x` : '按模型计价'
        return (
          <section key={`${def.family}-${def.label}`} className='flex flex-col gap-3'>
            {/* 档位标题 + 收费倍率 */}
            <div className='flex items-center gap-2.5 pt-1'>
              <h3 className='shrink-0 text-sm font-bold tracking-tight'>
                {def.emoji} {def.label}
              </h3>
              <span className='shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary dark:bg-primary/15'>
                收费倍率 {ratioLabel}
              </span>
              <span className='bg-border h-px flex-1' aria-hidden='true' />
            </div>
            {list.map(renderCard)}
          </section>
        )
      })}

      {hasTierGroups && otherModels.length > 0 ? (
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
