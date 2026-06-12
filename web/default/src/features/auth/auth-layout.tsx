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
import { useTranslation } from 'react-i18next'
import { useSystemConfig } from '@/hooks/use-system-config'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageDropdown } from '@/components/message-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { SoftAurora } from '@/components/effects/SoftAurora'

type AuthLayoutProps = {
  children: React.ReactNode
  brandPanel?: React.ReactNode
}

export function AuthLayout({ children, brandPanel }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()
  const year = new Date().getFullYear()

  return (
    <div
      className='relative flex min-h-svh flex-col bg-slate-50 dark:bg-slate-950'
    >
      <SoftAurora />
      {/* Top Navbar — gradient frosted glass */}
      <header className='sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-slate-200/40 bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/40 backdrop-blur-md dark:border-slate-800/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/90'>
        <div className='flex w-full items-center justify-between px-4 md:px-6'>
          {/* Left: Logo + Brand */}
          <Link
            to='/'
            className='flex items-center gap-2.5 transition-opacity hover:opacity-80'
          >
            <div className='relative h-7 w-7 shrink-0'>
              {loading ? (
                <Skeleton className='absolute inset-0 rounded-full' />
              ) : (
                <img
                  src={logo}
                  alt={t('Logo')}
                  className='h-7 w-7 rounded-full object-cover'
                />
              )}
            </div>
            {loading ? (
              <Skeleton className='h-5 w-24' />
            ) : (
              <span className='truncate text-base font-bold text-slate-900 dark:text-white'>
                {systemName}
              </span>
            )}
          </Link>

          {/* Right: Nav + Theme */}
          <div className='flex items-center gap-4'>
            <nav className='flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-400'>
              <Link
                to='/'
                className='inline-block transition-all duration-200 hover:scale-105 hover:text-slate-900 dark:hover:text-white'
              >
                {t('Home')}
              </Link>
              <a
                href='#'
                className='inline-block transition-all duration-200 hover:scale-105 hover:text-slate-900 dark:hover:text-white'
              >
                {t('Docs')}
              </a>
            </nav>
            <div className='ml-2 flex items-center gap-1 border-l border-slate-200 pl-4 dark:border-slate-700'>
              <MessageDropdown />
              <LanguageSwitcher />
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {brandPanel ? (
        /* Two-column layout with brand panel */
        <main className='flex flex-1 items-center justify-center px-4 py-10 md:px-8 md:py-0'>
          <div className='grid w-full max-w-5xl gap-8 md:grid-cols-2 md:gap-12 lg:gap-16'>
            {/* Left: Brand Panel */}
            <div className='flex items-center justify-center md:justify-end'>
              <div className='w-full max-w-md'>{brandPanel}</div>
            </div>
            {/* Right: Form Area (no card — matches left side) */}
            <div className='flex items-center justify-center md:justify-start'>
              <div className='w-full max-w-[400px]'>{children}</div>
            </div>
          </div>
        </main>
      ) : (
        /* Centered card layout (default) */
        <main className='flex flex-1 items-center justify-center px-4 py-10 md:py-16'>
          <div className='w-full max-w-[440px]'>
            <div className='rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-shadow duration-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900'>
              {children}
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className='py-6 text-center text-xs text-slate-400 dark:text-slate-500'>
        &copy; {year} {systemName}.{' '}
        {t('Powered by')}{' '}
        <a
          href='https://github.com/QuantumNous/new-api'
          target='_blank'
          rel='noopener noreferrer'
          className='underline underline-offset-4 transition-colors hover:text-slate-600 dark:hover:text-slate-400'
        >
          {systemName}
        </a>
      </footer>
    </div>
  )
}
