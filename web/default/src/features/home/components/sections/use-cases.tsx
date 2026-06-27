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
import { Terminal, Building2, Rocket, GraduationCap } from 'lucide-react'
import { AnimateInView } from '@/components/animate-in-view'
import { USE_CASES } from '../../constants'

export function UseCases() {
  const { t } = useTranslation()

  return (
    <section className='relative z-10 px-6 py-20 md:py-28'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-16 text-center md:mb-20'>
          <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
            {t('Use Cases')}
          </p>
          <h2 className='text-2xl leading-tight font-bold tracking-tight md:text-3xl'>
            {t('From indie dev to enterprise,')}
            <br />
            {t('one solution fits all')}
          </h2>
          <p className='text-muted-foreground/70 mx-auto mt-4 max-w-md text-sm leading-relaxed'>
            {t(
              'No GPU cluster, no overseas payment hassles. All you need is one API key.'
            )}
          </p>
        </AnimateInView>

        {/* 4-column grid */}
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
          {USE_CASES.map((uc, i) => (
            <AnimateInView
              key={uc.title}
              delay={i * 100}
              animation='fade-up'
              className='border-border/40 bg-muted/5 hover:bg-muted/10 hover:border-border/60 group rounded-xl border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm'
            >
              <div className='mb-4 flex size-10 items-center justify-center rounded-lg border border-border/30 bg-muted/20 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors duration-300' aria-hidden>
                {uc.icon === 'Terminal' && <Terminal className='size-5 text-muted-foreground group-hover:text-primary transition-colors duration-300' strokeWidth={1.5} />}
                {uc.icon === 'Building2' && <Building2 className='size-5 text-muted-foreground group-hover:text-primary transition-colors duration-300' strokeWidth={1.5} />}
                {uc.icon === 'Rocket' && <Rocket className='size-5 text-muted-foreground group-hover:text-primary transition-colors duration-300' strokeWidth={1.5} />}
                {uc.icon === 'GraduationCap' && <GraduationCap className='size-5 text-muted-foreground group-hover:text-primary transition-colors duration-300' strokeWidth={1.5} />}
              </div>
              <h3 className='mb-2 text-sm font-semibold'>{t(uc.title)}</h3>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                {t(uc.description)}
              </p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
