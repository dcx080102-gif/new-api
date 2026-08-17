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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export function BillingExplanation(props: { className?: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('rounded-xl border border-border/60 bg-card/50', props.className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className='flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/30 transition-colors rounded-xl'>
          <HelpCircle className='size-4 text-primary shrink-0' />
          <span className='text-sm font-semibold flex-1'>
            {t('How billing works')}
          </span>
          <span className='text-xs text-muted-foreground'>
            {t('Click to learn about pricing logic')}
          </span>
          <ChevronDown className={cn(
            'size-4 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180'
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className='px-4 pb-4 pt-1 space-y-4 text-sm text-muted-foreground border-t border-border/40 mx-4'>
            {/* 倍率说明 */}
            <div>
              <h4 className='text-foreground font-medium mb-1.5'>
                {t('倍率 (Ratio)')}
              </h4>
              <p>
                {t('每个模型都有一个「倍率」(ModelRatio) 和一个「输出系数」(CompletionRatio)。它们是计费的基准数字，不是最终价格。')}
              </p>
            </div>

            {/* 计费公式 */}
            <div>
              <h4 className='text-foreground font-medium mb-1.5'>
                {t('计费公式')}
              </h4>
              <div className='bg-muted/50 rounded-lg p-3 font-mono text-xs space-y-1'>
                <div>
                  <span className='text-primary'>输入费用</span>
                  {' = 输入 Token 数 ÷ 1,000,000 × ModelRatio × 7.3'}
                </div>
                <div>
                  <span className='text-primary'>输出费用</span>
                  {' = 输出 Token 数 ÷ 1,000,000 × ModelRatio × CompletionRatio × 7.3'}
                </div>
                <div className='text-muted-foreground/60 pt-1 border-t border-border/30 mt-1'>
                  {t('7.3 为系统汇率，1 美元 = 7.3 人民币')}
                </div>
              </div>
            </div>

            {/* 显示价格 vs 实扣 */}
            <div>
              <h4 className='text-foreground font-medium mb-1.5'>
                {t('为什么显示价格和实际扣费不一样？')}
              </h4>
              <p>
                {t('页面上显示的「$XX/1M」是按 $2/百万 Token 的基准计算的建议零售价，方便你快速对比不同模型。')}
              </p>
              <p className='mt-1'>
                {t('但你的账户充值采用 1元 = 1美元额度，系统后端按 ¥7.3/$ 的汇率实际结算，所以实际扣费 = 显示价格 × 3.65。')}
              </p>
              <div className='bg-muted/50 rounded-lg p-3 mt-2 text-xs font-mono'>
                <div>{t('例：deepseek-chat 显示 $0.27/1M 输入')}</div>
                <div className='text-primary'>
                  {t('实际扣费 = 0.27 × 3.65 = ¥0.99/1M 输入')}
                </div>
              </div>
            </div>

            {/* 分组倍率 */}
            <div>
              <h4 className='text-foreground font-medium mb-1.5'>
                {t('分组倍率 (Group Ratio)')}
              </h4>
              <p>
                {t('不同用户分组可能有不同的倍率折扣。分组倍率会乘在最终价格上。默认分组倍率为 ×1（无折扣）。')}
              </p>
            </div>

            {/* 按量 vs 按次 */}
            <div>
              <h4 className='text-foreground font-medium mb-1.5'>
                {t('按量计费 vs 按次计费')}
              </h4>
              <p>
                {t('「按量」模型根据实际消耗的 Token 数计费。「按次」模型（如图像/视频生成）每次调用收取固定费用，显示为「$X.XX/次」。')}
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
