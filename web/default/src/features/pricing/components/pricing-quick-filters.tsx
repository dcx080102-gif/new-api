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

For commercial licensing, please contact support@quantumnous.com>
*/
import { useTranslation } from 'react-i18next'
import { Star, Sparkles, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QUICK_FILTERS } from '../constants'

export interface QuickFilterPillsProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

interface QuickPill {
  value: string
  label: string
  icon?: React.ReactNode
}

export function QuickFilterPills(props: QuickFilterPillsProps) {
  const { t } = useTranslation()

  const pills: QuickPill[] = [
    { value: QUICK_FILTERS.ALL, label: t('All') },
    {
      value: QUICK_FILTERS.HOT,
      label: t('Hot'),
      icon: <Star className='size-3.5' />,
    },
    {
      value: QUICK_FILTERS.FREE,
      label: t('Free'),
      icon: <Sparkles className='size-3.5' />,
    },
    {
      value: QUICK_FILTERS.DISCOUNT,
      label: t('Discount'),
      icon: <Percent className='size-3.5' />,
    },
  ]

  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto pb-1',
        // Hide scrollbar but keep functionality
        'scrollbar-none',
        props.className
      )}
    >
      {pills.map((pill) => (
        <button
          key={pill.value}
          type='button'
          onClick={() => props.onChange(pill.value)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
            'hover:border-primary/40 hover:bg-primary/5 hover:scale-105',
            'focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none',
            props.value === pill.value
              ? 'border-primary/40 bg-primary/10 text-primary dark:bg-primary/15'
              : 'border-border/60 text-muted-foreground'
          )}
        >
          {pill.icon}
          {pill.label}
        </button>
      ))}
    </div>
  )
}
