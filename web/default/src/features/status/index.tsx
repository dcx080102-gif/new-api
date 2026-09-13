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
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { StatusPanel } from './status-panel'

export function Status() {
  const { t } = useTranslation()
  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition className='relative mx-auto w-full max-w-[1100px] px-4 pt-14 pb-10 sm:px-6 sm:pt-16'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
            {t('Service Status')}
          </h1>
          <p className='text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed'>
            {t(
              'Availability is computed from both active probes (a short message sent every 15 minutes) and real customer traffic. This page is public and refreshes every minute.'
            )}
          </p>
        </div>
        <StatusPanel />
      </PageTransition>
    </PublicLayout>
  )
}

export { StatusCollapsible } from './status-panel'
