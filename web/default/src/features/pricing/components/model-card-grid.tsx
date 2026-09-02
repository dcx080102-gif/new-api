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
// 档位分组（otter Link 定制）：GPT 按收费倍率分三档，Claude 按产品线分三档，
// 每档标题后标注收费倍率。倍率从模型数据动态读取，修改定价后自动跟随。
// ----------------------------------------------------------------------------

type TierFamily = 'gpt' | 'claude'

interface ModelTierDef {
  family: TierFamily
  ratio: number
  label: string
  emoji: string
}

const TIER_DEFS: ModelTierDef[] = [
  { family: 'gpt', ratio: 0.55, label: '旗舰档', emoji: '🏆' },
  { family: 'gpt', ratio: 0.3425, label: '主力档', emoji: '💪' },
  { family: 'gpt', ratio: 0.25, label: '轻量档', emoji: '🪶' },
  { family: 'claude', ratio: 1.6, label: 'Opus 档', emoji: '🥇' },
  { family: 'claude', ratio: 0.96, label: 'Sonnet 档', emoji: '🥈' },
  { family: 'claude', ratio: 0.32, label: 'Haiku 档', emoji: '🥉' },
]

function getTierFamily(modelName: string): TierFamily | null {
  if (/^(gpt|codex)/i.test(modelName)) return 'gpt'
  if (/^claude/i.test(modelName)) return 'claude'
  return null
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

  // 按档位分组：系列 + 倍率命中档位 → 分组；其余 → 保持原样
  const tierModels: PricingModel[][] = TIER_DEFS.map(() => [])
  const otherModels: PricingModel[] = []

  for (const model of props.models) {
    const name = model.model_name || ''
    const family = getTierFamily(name)
    if (!family) {
      otherModels.push(model)
      continue
    }
    const tierIndex = TIER_DEFS.findIndex(
      (def) => def.family === family && def.ratio === model.model_ratio
    )
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
        return (
          <section key={`${def.family}-${def.label}`} className='flex flex-col gap-3'>
            {/* 档位标题 + 收费倍率 */}
            <div className='flex items-center gap-2.5 pt-1'>
              <h3 className='shrink-0 text-sm font-bold tracking-tight'>
                {def.emoji} {def.label}
              </h3>
              <span className='shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary dark:bg-primary/15'>
                收费倍率 {def.ratio}x
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
