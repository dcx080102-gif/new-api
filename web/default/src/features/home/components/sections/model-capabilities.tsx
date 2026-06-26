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
import { ArrowRight, MessagesSquare, Image, Mic, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'
import { MODEL_CAPABILITIES } from '../../constants'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  MessagesSquare,
  Image,
  Mic,
  Video,
}

export function ModelCapabilities() {
  const { t } = useTranslation()

  return (
    <section className='border-border/40 relative z-10 border-t px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-16 max-w-lg'>
          <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
            {t('Model Capabilities')}
          </p>
          <h2 className='text-2xl leading-tight font-bold tracking-tight md:text-3xl'>
            {t('One API,')}
            <br />
            {t('all capabilities')}
          </h2>
          <p className='text-muted-foreground/70 mt-4 text-sm leading-relaxed'>
            {t(
              'Text, image, voice, video — one API key unlocks everything.'
            )}
          </p>
        </AnimateInView>

        {/* 2x2 grid */}
        <div className='grid gap-5 sm:grid-cols-2'>
          {MODEL_CAPABILITIES.map((cap, i) => {
            const IconComp = ICON_MAP[cap.icon]
            return (
              <AnimateInView
                key={cap.title}
                delay={i * 100}
                animation='scale-in'
                className='border-border/40 bg-muted/5 hover:bg-muted/10 hover:border-border/60 group rounded-xl border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm sm:p-8'
              >
                <div className='flex items-start gap-4'>
                  <div className='flex size-10 flex-shrink-0 items-center justify-center rounded-lg border border-border/30 bg-muted/20 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors duration-300'>
                    {IconComp && (
                      <IconComp
                        className='size-5 text-muted-foreground group-hover:text-primary transition-colors duration-300'
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h3 className='mb-1 text-sm font-semibold'>{t(cap.title)}</h3>
                    <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>
                      {cap.models}
                    </p>
                    <div className='mt-3 flex items-center gap-3'>
                      <span className='text-muted-foreground inline-flex items-center rounded-full border border-border/40 px-2 py-0.5 text-[11px] font-medium tabular-nums'>
                        {cap.count} {t('models')}
                      </span>
                      <Link
                        to='/pricing'
                        className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] font-medium transition-colors'
                      >
                        {t('View all')}
                        <ArrowRight className='size-3' />
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimateInView>
            )
          })}
        </div>
      </div>
    </section>
  )
}
