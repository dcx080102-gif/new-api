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

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

export function Hero(_props: HeroProps) {
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

      {/* Heading */}
      <div className='landing-animate-fade-up flex max-w-3xl flex-col items-center text-center opacity-0' style={{ animationDelay: '0ms' }}>
        <h1 className='text-[clamp(1.8rem,5vw,3.2rem)] leading-[1.2] font-extrabold tracking-tight'>
          <span className='text-foreground'>otter Link</span>
          <span className='text-muted-foreground/40 mx-3 font-normal'>——</span>
          <span className='bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent'>
            {t('AI at Your Fingertips')}
          </span>
        </h1>
        <p className='mt-3 text-sm font-medium tracking-wide text-muted-foreground/60 sm:text-base'>
          <span>{t('Unified AI Model Aggregator')}</span>
          <span className='text-muted-foreground/30 mx-2'>·</span>
          <span>{t('OpenAI Compatible Relay')}</span>
        </p>
      </div>
    </section>
  )
}
