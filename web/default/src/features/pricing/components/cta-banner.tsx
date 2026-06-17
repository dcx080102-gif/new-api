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
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Key, Wallet, UserPlus } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { getApiKeys } from '@/features/keys/api'
import { cn } from '@/lib/utils'

// ============================================================================
// CTA Banner — shown on the Pricing page to guide users
// ============================================================================

type CtaVariant = 'no-auth' | 'no-key' | 'low-quota' | 'hidden'

interface CtaContent {
  icon: React.ReactNode
  title: string
  description: string
  buttonLabel: string
  href: string
}

export function CtaBanner({ className }: { className?: string }) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.auth.user)

  const [hasKeys, setHasKeys] = useState<boolean | null>(null)
  const [loadingKeys, setLoadingKeys] = useState(false)

  // Check if the logged-in user has any API keys
  useEffect(() => {
    if (!user) {
      setHasKeys(null)
      return
    }
    let cancelled = false
    setLoadingKeys(true)
    getApiKeys({ p: 1, size: 1 })
      .then((result) => {
        if (cancelled) return
        const items = result.data?.items ?? []
        setHasKeys(items.length > 0)
      })
      .catch(() => {
        if (!cancelled) setHasKeys(false)
      })
      .finally(() => {
        if (!cancelled) setLoadingKeys(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  // Determine which variant to show
  const quota = user?.quota ?? 0
  const LOW_QUOTA_THRESHOLD = 500

  let variant: CtaVariant = 'hidden'

  if (!user) {
    variant = 'no-auth'
  } else if (loadingKeys || hasKeys === null) {
    // Still loading — don't flash the wrong banner
    variant = 'hidden'
  } else if (!hasKeys) {
    variant = 'no-key'
  } else if (quota <= LOW_QUOTA_THRESHOLD) {
    variant = 'low-quota'
  } else {
    variant = 'hidden'
  }

  if (variant === 'hidden') return null

  // Content map — keyed by variant
  const content: Record<CtaVariant, CtaContent | null> = {
    hidden: null,
    'no-auth': {
      icon: <UserPlus className='size-5 shrink-0' />,
      title: t('🔑 Use all these models with just one API Key'),
      description: t(
        'Sign up, generate a Key, and all models are available on a pay-as-you-go basis.'
      ),
      buttonLabel: t('Free Sign Up'),
      href: '/sign-up',
    },
    'no-key': {
      icon: <Key className='size-5 shrink-0' />,
      title: t("🔑 You don't have an API Key yet"),
      description: t(
        'Generate one in the Console and start using it right away.'
      ),
      buttonLabel: t('Generate API Key'),
      href: '/keys',
    },
    'low-quota': {
      icon: <Wallet className='size-5 shrink-0' />,
      title: t('💰 Low balance'),
      description: t(
        'Your current balance may not be enough. Top up first before using.'
      ),
      buttonLabel: t('Top Up'),
      href: '/wallet',
    },
  }

  const cta = content[variant]
  if (!cta) return null

  const handleClick = () => {
    window.location.href = cta.href
  }

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-2xl rounded-xl border px-5 py-4',
        'bg-blue-50 border-blue-200',
        'dark:bg-blue-950 dark:border-blue-800',
        className
      )}
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        {/* Left: icon + text */}
        <div className='flex items-start gap-3 sm:items-center'>
          <span className='mt-0.5 text-blue-700 dark:text-blue-400 sm:mt-0'>
            {cta.icon}
          </span>
          <div className='min-w-0'>
            <p className='text-foreground text-sm font-semibold sm:text-base'>
              {cta.title}
            </p>
            <p className='text-muted-foreground mt-0.5 text-xs leading-relaxed sm:text-sm'>
              {cta.description}
            </p>
          </div>
        </div>

        {/* Right: action button */}
        <button
          type='button'
          onClick={handleClick}
          className={cn(
            'shrink-0 self-start sm:self-center',
            'inline-flex items-center gap-1.5 rounded-lg px-4 py-2',
            'text-sm font-semibold text-white',
            'bg-blue-800 hover:bg-blue-700 active:bg-blue-900',
            'dark:bg-blue-700 dark:hover:bg-blue-600 dark:active:bg-blue-800',
            'transition-all duration-200',
            'hover:scale-[1.03] hover:shadow-md',
            'focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none',
            'min-h-[44px]'
          )}
        >
          {cta.buttonLabel}
        </button>
      </div>
    </div>
  )
}
