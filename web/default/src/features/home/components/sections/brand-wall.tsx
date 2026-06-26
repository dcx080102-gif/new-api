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
import { BRAND_LOGOS } from '../../constants'

const duplicated = [...BRAND_LOGOS, ...BRAND_LOGOS]

export function BrandWall() {
  const { t } = useTranslation()

  return (
    <section className='border-border/40 relative z-10 border-b py-10 md:py-14'>
      <p className='text-muted-foreground mb-6 text-center text-[11px] font-medium tracking-[0.2em] uppercase'>
        {t('Connected Model Providers')}
      </p>

      {/* Horizontal marquee */}
      <div className='overflow-hidden'>
        <div
          className='flex w-max gap-3 py-2 animate-marquee-horizontal'
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          }}
        >
          {duplicated.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className='border-border/40 bg-muted/10 hover:bg-muted/20 hover:border-border/60 flex-shrink-0 select-none rounded-lg border px-5 py-3 text-sm font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground hover:shadow-sm'
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
