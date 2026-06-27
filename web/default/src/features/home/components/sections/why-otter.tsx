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
import {
  Zap,
  Eye,
  Shield,
  Plug,
  BarChart3,
  BadgeCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'
import { WHY_OTTER_CARDS } from '../../constants'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Zap,
  Eye,
  Shield,
  Plug,
  BarChart3,
  BadgeCheck,
}

export function WhyOtter() {
  const { t } = useTranslation()

  return (
    <section className='relative z-10 px-6 py-28 md:py-36'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-16 max-w-lg'>
          <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
            {t('Why otter Link?')}
          </p>
          <h2 className='text-2xl leading-tight font-bold tracking-tight md:text-3xl'>
            {t('Built for developers,')}
            <br />
            {t('built for trust')}
          </h2>
          <p className='text-muted-foreground/70 mt-4 text-sm leading-relaxed'>
            {t(
              'More than a proxy — we rethought how AI API should be served.'
            )}
          </p>
        </AnimateInView>

        {/* Staggered 2-column layout */}
        <div className='grid gap-6 sm:grid-cols-2'>
          {WHY_OTTER_CARDS.map((card, i) => {
            const IconComp = ICON_MAP[card.icon]
            const isLeft = i % 2 === 0
            return (
              <AnimateInView
                key={card.title}
                delay={i * 80}
                animation='scale-in'
                className={`
                  group rounded-xl border transition-all duration-300
                  hover:-translate-y-0.5
                  border-border/40 bg-muted/5 hover:bg-muted/10 hover:border-primary/30
                  ${!isLeft ? 'border-l-2 border-l-transparent hover:border-l-primary/40' : ''}
                `}
              >
                {isLeft ? (
                  /* Left card: horizontal layout */
                  <div className='flex items-start gap-4 p-6'>
                    <div className='flex size-10 flex-shrink-0 items-center justify-center rounded-lg border border-border/30 bg-muted/20 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors duration-300'>
                      {IconComp && (
                        <IconComp className='size-5 text-muted-foreground group-hover:text-primary transition-colors duration-300' strokeWidth={1.5} />
                      )}
                    </div>
                    <div className='min-w-0'>
                      <h3 className='mb-1.5 text-sm font-semibold'>{t(card.title)}</h3>
                      <p className='text-muted-foreground text-xs leading-relaxed'>{t(card.description)}</p>
                    </div>
                  </div>
                ) : (
                  /* Right card: vertical layout with left accent border */
                  <div className='p-6 pl-5'>
                    <div className='mb-3 flex size-10 items-center justify-center rounded-lg border border-border/30 bg-muted/20 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors duration-300'>
                      {IconComp && (
                        <IconComp className='size-5 text-muted-foreground group-hover:text-primary transition-colors duration-300' strokeWidth={1.5} />
                      )}
                    </div>
                    <h3 className='mb-2 text-sm font-semibold'>{t(card.title)}</h3>
                    <p className='text-muted-foreground text-xs leading-relaxed'>{t(card.description)}</p>
                  </div>
                )}
              </AnimateInView>
            )
          })}
        </div>
      </div>
    </section>
  )
}
