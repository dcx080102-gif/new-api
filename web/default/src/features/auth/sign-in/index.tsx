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
import { useState, useMemo } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { X, AlertTriangle, Shield, Lock, Activity, Zap, Server, Users } from 'lucide-react'
import { useStatus } from '@/hooks/use-status'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { t } = useTranslation()
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const { status } = useStatus()

  const showExpired = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('expired') === 'true'
  }, [])
  const [expiredBannerDismissed, setExpiredBannerDismissed] = useState(false)

  // Mock real-time stats — in production these come from API
  const stats = {
    requestCount: '128,000',
    modelCount: '40+',
    uptime: '99.9%',
    latency: '<80ms',
  }

  return (
    <AuthLayout>
      <div className='w-full space-y-6'>
        {/* Card wrapper */}
        <div className='rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          {/* Session Expired Banner */}
          {showExpired && !expiredBannerDismissed && (
            <div className='mb-5 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200'>
              <AlertTriangle className='h-4 w-4 shrink-0' />
              <span className='flex-1'>{t('Login expired, please sign in again')}</span>
              <button
                type='button'
                onClick={() => setExpiredBannerDismissed(true)}
                className='shrink-0 rounded p-0.5 transition-colors hover:bg-amber-200 dark:hover:bg-amber-800'
                aria-label={t('Dismiss')}
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          )}

          {/* Real-time Status Bar */}
          <div className='mb-6 flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm dark:border-emerald-800 dark:bg-emerald-950'>
            <span className='relative flex h-2 w-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500' />
            </span>
            <span className='font-medium text-emerald-700 dark:text-emerald-300'>
              所有服务运行正常
            </span>
            <span className='text-emerald-600/50 dark:text-emerald-400/50'>·</span>
            <span className='text-emerald-600 dark:text-emerald-400'>
              今日已处理 {stats.requestCount}+ 请求
            </span>
          </div>

          {/* Sign-in Heading */}
          <div className='space-y-2'>
            <h2 className='text-center text-2xl font-semibold tracking-tight sm:text-left'>
              {t('Sign in')}
            </h2>
            {!status?.self_use_mode_enabled &&
              status?.register_enabled !== false && (
                <p className='text-muted-foreground text-left text-sm sm:text-base'>
                  {t("Don't have an account?")}{' '}
                  <Link
                    to='/sign-up'
                    className='hover:text-primary font-medium underline underline-offset-4'
                  >
                    {t('Sign up')}
                  </Link>
                </p>
              )}
          </div>

          <UserAuthForm redirectTo={redirect} />
        </div>

        {/* Trust Badges */}
        <div className='grid grid-cols-3 gap-3'>
          <div className='flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900'>
            <Lock className='h-5 w-5 text-blue-500' />
            <span className='text-xs font-medium text-slate-700 dark:text-slate-300'>
              SSL/TLS 加密
            </span>
            <span className='text-[10px] text-slate-400 dark:text-slate-500'>
              银行级传输安全
            </span>
          </div>
          <div className='flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900'>
            <Shield className='h-5 w-5 text-emerald-500' />
            <span className='text-xs font-medium text-slate-700 dark:text-slate-300'>
              数据隔离
            </span>
            <span className='text-[10px] text-slate-400 dark:text-slate-500'>
              你的数据属于你
            </span>
          </div>
          <div className='flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900'>
            <Activity className='h-5 w-5 text-amber-500' />
            <span className='text-xs font-medium text-slate-700 dark:text-slate-300'>
              7×24 监控
            </span>
            <span className='text-[10px] text-slate-400 dark:text-slate-500'>
              全天候守护
            </span>
          </div>
        </div>

        {/* Platform Stats Cards */}
        <div className='grid grid-cols-4 gap-2'>
          <div className='flex flex-col items-center rounded-lg border border-slate-200 bg-white px-2 py-3 dark:border-slate-800 dark:bg-slate-900'>
            <Zap className='mb-1 h-4 w-4 text-amber-500' />
            <span className='text-sm font-bold text-slate-900 dark:text-white'>{stats.modelCount}</span>
            <span className='text-[10px] text-slate-400 dark:text-slate-500'>AI 模型</span>
          </div>
          <div className='flex flex-col items-center rounded-lg border border-slate-200 bg-white px-2 py-3 dark:border-slate-800 dark:bg-slate-900'>
            <Server className='mb-1 h-4 w-4 text-blue-500' />
            <span className='text-sm font-bold text-slate-900 dark:text-white'>{stats.uptime}</span>
            <span className='text-[10px] text-slate-400 dark:text-slate-500'>可用性</span>
          </div>
          <div className='flex flex-col items-center rounded-lg border border-slate-200 bg-white px-2 py-3 dark:border-slate-800 dark:bg-slate-900'>
            <Activity className='mb-1 h-4 w-4 text-emerald-500' />
            <span className='text-sm font-bold text-slate-900 dark:text-white'>{stats.latency}</span>
            <span className='text-[10px] text-slate-400 dark:text-slate-500'>平均延迟</span>
          </div>
          <div className='flex flex-col items-center rounded-lg border border-slate-200 bg-white px-2 py-3 dark:border-slate-800 dark:bg-slate-900'>
            <Users className='mb-1 h-4 w-4 text-violet-500' />
            <span className='text-sm font-bold text-slate-900 dark:text-white'>{stats.requestCount}+</span>
            <span className='text-[10px] text-slate-400 dark:text-slate-500'>日请求</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
