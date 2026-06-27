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
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'
import { cn } from '@/lib/utils'
import { FAQ_ITEMS } from '../../constants'

export function FAQ() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section className='border-border/40 relative z-10 border-t px-6 py-16 md:py-24'>
      <div className='mx-auto max-w-2xl'>
        <AnimateInView className='mb-16 text-center'>
          <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
            {t('FAQ')}
          </p>
          <h2 className='text-2xl leading-tight font-bold tracking-tight md:text-3xl'>
            {t('Still have questions?')}
          </h2>
          <p className='text-muted-foreground/70 mx-auto mt-4 max-w-md text-sm leading-relaxed'>
            {t(
              'Common questions and answers about otter Link'
            )}
          </p>
        </AnimateInView>

        {/* Accordion */}
        <div className='space-y-3'>
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className='border-border/40 bg-muted/5 rounded-xl border transition-colors duration-200'
              >
                <button
                  onClick={() => toggle(i)}
                  className='flex w-full items-center justify-between px-5 py-4 text-left'
                >
                  <span className='pr-4 text-sm font-medium'>
                    {t(item.q)}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-4 flex-shrink-0 text-muted-foreground transition-transform duration-300',
                      isOpen && 'rotate-180'
                    )}
                    strokeWidth={1.5}
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-all duration-300',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  )}
                >
                  <div className='overflow-hidden'>
                    <div className='text-muted-foreground px-5 pb-4 text-sm leading-relaxed'>
                      {t(item.a)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
