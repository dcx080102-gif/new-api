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
import { Copy, Check, Gift, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserProfile } from '../types'

interface InviteCardProps {
  profile: UserProfile | null
  loading: boolean
}

export function InviteCard({ profile, loading }: InviteCardProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  if (loading) {
    return (
      <Card className='gap-0 overflow-hidden py-0'>
        <CardHeader className='border-b p-3 !pb-3 sm:p-5 sm:!pb-5'>
          <Skeleton className='h-6 w-32' />
        </CardHeader>
        <CardContent className='space-y-4 p-3 sm:p-5'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-8 w-full' />
        </CardContent>
      </Card>
    )
  }

  const affCode = profile?.aff_code || ''
  const affCount = profile?.aff_count || 0
  const affQuota = profile?.aff_quota || 0
  const inviteLink = affCode
    ? `${window.location.origin}/sign-up?aff=${affCode}`
    : ''

  const handleCopyLink = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleCopyCode = () => {
    if (!affCode) return
    navigator.clipboard.writeText(affCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card className='gap-0 overflow-hidden py-0'>
      <CardHeader className='flex flex-row items-center gap-2 border-b p-3 !pb-3 sm:p-5 sm:!pb-5'>
        <Gift className='h-4 w-4 text-blue-600' />
        <span className='text-sm font-semibold'>{t('Invite & Earn')}</span>
      </CardHeader>
      <CardContent className='space-y-4 p-3 sm:p-5'>
        {/* Stats */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-950/30'>
            <div className='flex items-center justify-center gap-1'>
              <Users className='h-3.5 w-3.5 text-blue-600' />
              <span className='text-xs text-slate-500 dark:text-slate-400'>
                {t('Invited')}
              </span>
            </div>
            <p className='mt-1 text-lg font-bold text-blue-700 dark:text-blue-300'>
              {affCount}
            </p>
          </div>
          <div className='rounded-lg bg-amber-50 p-3 text-center dark:bg-amber-950/30'>
            <div className='flex items-center justify-center gap-1'>
              <Gift className='h-3.5 w-3.5 text-amber-600' />
              <span className='text-xs text-slate-500 dark:text-slate-400'>
                {t('Bonus')}
              </span>
            </div>
            <p className='mt-1 text-lg font-bold text-amber-700 dark:text-amber-300'>
              {affQuota.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Invite Code */}
        {affCode ? (
          <>
            <div>
              <p className='mb-1.5 text-xs text-slate-500 dark:text-slate-400'>
                {t('Your invite code')}
              </p>
              <button
                type='button'
                onClick={handleCopyCode}
                className='flex w-full items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-mono font-bold tracking-widest text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-600 dark:hover:bg-blue-950/30'
              >
                <span>{affCode}</span>
                {copied ? (
                  <Check className='h-3.5 w-3.5 text-green-500' />
                ) : (
                  <Copy className='h-3.5 w-3.5 text-slate-400' />
                )}
              </button>
            </div>

            {/* Invite Link */}
            <div>
              <p className='mb-1.5 text-xs text-slate-500 dark:text-slate-400'>
                {t('Share your invite link')}
              </p>
              <button
                type='button'
                onClick={handleCopyLink}
                className='flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-600 dark:hover:bg-blue-950/30'
              >
                <span className='truncate text-left'>{inviteLink}</span>
                {copied ? (
                  <Check className='h-3.5 w-3.5 shrink-0 text-green-500' />
                ) : (
                  <Copy className='h-3.5 w-3.5 shrink-0 text-slate-400' />
                )}
              </button>
            </div>
          </>
        ) : (
          <p className='text-center text-sm text-slate-400'>
            {t('Invite code loading...')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
