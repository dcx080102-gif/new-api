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
import { useAuthStore } from '@/stores/auth-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatPrice } from '../lib/price'
import { isTokenBasedModel } from '../lib/model-helpers'
import { DEFAULT_TOKEN_UNIT } from '../constants'
import type { PricingModel, TokenUnit } from '../types'

export interface PurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  model: PricingModel
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
}

export function PurchaseDialog(props: PurchaseDialogProps) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.auth.user)
  const priceRate = props.priceRate ?? 1
  const usdExchangeRate = props.usdExchangeRate ?? 1
  const showRechargePrice = props.showRechargePrice ?? false
  const tokenUnit = props.tokenUnit ?? DEFAULT_TOKEN_UNIT
  const tokenUnitLabel = tokenUnit === 'K' ? '1K' : '1M'

  const modelName = props.model.model_name || ''
  const isTokenBased = isTokenBasedModel(props.model)
  const quota = user?.quota ?? 0

  const handleGoWallet = () => {
    window.location.href = '/wallet'
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {t('Purchase')} {modelName}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          {isTokenBased ? (
            <>
              <div className='flex items-baseline justify-between text-sm'>
                <span className='text-muted-foreground'>
                  {t('Input Price')}
                </span>
                <span className='text-foreground font-mono font-semibold'>
                  {formatPrice(
                    props.model,
                    'input',
                    tokenUnit,
                    showRechargePrice,
                    priceRate,
                    usdExchangeRate
                  )}
                  <span className='text-muted-foreground/60 font-normal text-xs'>
                    {' / '}
                    {tokenUnitLabel} tokens
                  </span>
                </span>
              </div>
              <div className='flex items-baseline justify-between text-sm'>
                <span className='text-muted-foreground'>
                  {t('Output Price')}
                </span>
                <span className='text-foreground font-mono font-semibold'>
                  {formatPrice(
                    props.model,
                    'output',
                    tokenUnit,
                    showRechargePrice,
                    priceRate,
                    usdExchangeRate
                  )}
                  <span className='text-muted-foreground/60 font-normal text-xs'>
                    {' / '}
                    {tokenUnitLabel} tokens
                  </span>
                </span>
              </div>
            </>
          ) : (
            <div className='flex items-baseline justify-between text-sm'>
              <span className='text-muted-foreground'>{t('Price')}</span>
              <span className='text-foreground font-mono font-semibold'>
                {formatPrice(
                  props.model,
                  'input',
                  tokenUnit,
                  showRechargePrice,
                  priceRate,
                  usdExchangeRate
                )}
              </span>
            </div>
          )}

          <div className='border-t border-border/60' />

          {/* Current balance */}
          <div className='flex items-baseline justify-between text-sm'>
            <span className='text-muted-foreground'>
              {t('Current Balance')}
            </span>
            <span className='text-foreground font-mono font-semibold'>
              ¥{quota.toFixed(2)}
            </span>
          </div>

          {/* Suggestion */}
          <p className='text-muted-foreground text-xs'>
            {t(
              'We recommend topping up at least ¥10 to start using this model.'
            )}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => props.onOpenChange(false)}
          >
            {t('Cancel')}
          </Button>
          <Button onClick={handleGoWallet}>
            {t('Go to Wallet')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
