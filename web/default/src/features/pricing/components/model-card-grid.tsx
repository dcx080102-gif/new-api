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
// GPT 档位分组（otter Link 定制）：按收费倍率把 GPT 系列模型分为三档，
// 每档标题后标注收费倍率。倍率从模型数据动态读取，修改定价后自动跟随。
// ----------------------------------------------------------------------------

interface GptTierDef {
  ratio: number
  label: string
  emoji: string
}

const GPT_TIER_DEFS: GptTierDef[] = [
  { ratio: 0.55, label: '旗舰档', emoji: '🏆' },
  { ratio: 0.3425, label: '主力档', emoji: '💪' },
  { ratio: 0.25, label: '轻量档', emoji: '🪶' },
]

function isGptFamily(modelName: string): boolean {
  return /^(gpt|codex)/i.test(modelName)
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

  // 按档位分组：GPT 系列 + 倍率命中档位 → 分组；其余 → 保持原样
  const tierModels: PricingModel[][] = GPT_TIER_DEFS.map(() => [])
  const otherModels: PricingModel[] = []

  for (const model of props.models) {
    const name = model.model_name || ''
    if (!isGptFamily(name)) {
      otherModels.push(model)
      continue
    }
    const tierIndex = GPT_TIER_DEFS.findIndex(
      (def) => def.ratio === model.model_ratio
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
      {GPT_TIER_DEFS.map((def, index) => {
        const list = tierModels[index]
        if (list.length === 0) {
          return null
        }
        return (
          <section key={def.label} className='flex flex-col gap-3'>
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
