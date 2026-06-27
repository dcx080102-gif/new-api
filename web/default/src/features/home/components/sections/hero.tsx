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
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { HERO_STATS } from '../../constants'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()

  return (
    <section className='relative z-10 flex flex-col items-center overflow-hidden px-6 pt-28 pb-16 md:pt-36 md:pb-24'>
      {/* Radial gradient background */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 opacity-[0.06] dark:opacity-[0.08]'
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 20% 20%, rgba(0,0,0,0.4) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 40% at 80% 15%, rgba(255,255,255,0.15) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 35% at 40% 80%, rgba(0,0,0,0.3) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      {/* Grid pattern */}
      <div
        aria-hidden
        className='absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black_20%,transparent_100%)] bg-[size:4rem_4rem] opacity-[0.08]'
      />

      <div className='flex max-w-3xl flex-col items-center text-center'>
        <div
          className='landing-animate-fade-up mt-8 flex flex-col items-center gap-3 sm:flex-row opacity-0'
          style={{ animationDelay: '0ms' }}
        >
          {props.isAuthenticated ? (
            <Button
              variant='outline'
              size='lg'
              className='group rounded-lg min-h-[44px] min-w-[180px]'
              render={<Link to='/dashboard' />}
            >
              {t('Go to Dashboard')}
              <ArrowRight className='ml-1 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
            </Button>
          ) : (
            <>
              <Button
                variant='outline'
                size='lg'
                className='group border-border/50 hover:border-border hover:bg-muted/50 rounded-lg min-h-[44px] min-w-[180px]'
                render={<Link to='/sign-up' />}
              >
                {t('Free Sign Up')}
                <ArrowRight className='ml-1 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='border-border/50 hover:border-border hover:bg-muted/50 rounded-lg min-h-[44px]'
                render={<Link to='/pricing' />}
              >
                {t('View 76+ Model Prices')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Platform stats bar */}
      <div className='landing-animate-fade-up mt-10 w-full max-w-2xl opacity-0' style={{ animationDelay: '220ms' }}>
        <div className='border-border/40 bg-muted/10 mx-auto flex divide-x divide-border/30 overflow-hidden rounded-xl border'>
          {HERO_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className='flex flex-1 flex-col items-center justify-center px-3 py-3.5 text-center transition-colors duration-300 hover:bg-muted/20 sm:px-4'
            >
              <span className='text-xl font-bold tracking-tight tabular-nums sm:text-2xl'>
                {t(stat.value)}
              </span>
              <span className='text-muted-foreground mt-0.5 text-[11px] sm:text-xs'>
                {t(stat.label)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
