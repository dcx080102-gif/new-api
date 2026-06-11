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
import { X, AlertTriangle, Zap, Shield, Activity, Coins } from 'lucide-react'
import { useStatus } from '@/hooks/use-status'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

const features = [
  {
    icon: Activity,
    title: '99.9% 在线率',
    desc: '多节点容灾，服务永不掉线',
  },
  {
    icon: Zap,
    title: '极速响应',
    desc: '平均延迟低于 80ms，丝滑体验',
  },
  {
    icon: Shield,
    title: '企业级安全',
    desc: '数据加密隔离，SOC 2 合规',
  },
  {
    icon: Coins,
    title: '透明计费',
    desc: '用多少付多少，无隐藏费用',
  },
]

function BrandPanel() {
  return (
    <div className='space-y-8 text-center md:text-left'>
      {/* Badge */}
      <div className='inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary'>
        <span className='relative flex h-2 w-2'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75' />
          <span className='relative inline-flex h-2 w-2 rounded-full bg-green-500' />
        </span>
        服务运行中
      </div>

      {/* Headline */}
      <div className='space-y-3'>
        <h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl'>
          一个 API
          <br />
          开启 AI 无限可能
        </h1>
        <p className='text-base text-slate-500 dark:text-slate-400'>
          汇聚 40+ AI 大模型，统一接入、统一计费、统一管理
        </p>
      </div>

      {/* Feature Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {features.map((f) => (
          <div
            key={f.title}
            className='flex items-start gap-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900'
          >
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <f.icon className='h-4 w-4' />
            </div>
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-slate-900 dark:text-white'>
                {f.title}
              </p>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Stat */}
      <div className='flex items-center justify-center gap-6 border-t border-slate-200 pt-6 dark:border-slate-800 md:justify-start'>
        <div className='text-center md:text-left'>
          <p className='text-2xl font-bold text-slate-900 dark:text-white'>
            128K+
          </p>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            开发者信赖
          </p>
        </div>
        <div className='h-10 w-px bg-slate-200 dark:bg-slate-800' />
        <div className='text-center md:text-left'>
          <p className='text-2xl font-bold text-slate-900 dark:text-white'>
            40+
          </p>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            AI 模型接入
          </p>
        </div>
        <div className='h-10 w-px bg-slate-200 dark:bg-slate-800' />
        <div className='text-center md:text-left'>
          <p className='text-2xl font-bold text-slate-900 dark:text-white'>
            10M+
          </p>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            日处理请求
          </p>
        </div>
      </div>
    </div>
  )
}

export function SignIn() {
  const { t } = useTranslation()
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const { status } = useStatus()

  const showExpired = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('expired') === 'true'
  }, [])
  const [expiredBannerDismissed, setExpiredBannerDismissed] = useState(false)

  return (
    <AuthLayout brandPanel={<BrandPanel />}>
      <div className='w-full space-y-8'>
        {/* Session Expired Banner */}
        {showExpired && !expiredBannerDismissed && (
          <div className='flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200'>
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
                  className='hover:text-primary inline-block font-medium underline underline-offset-4 transition-all duration-200 hover:scale-105'
                >
                  {t('Sign up')}
                </Link>
              </p>
            )}
        </div>

        <UserAuthForm redirectTo={redirect} />
      </div>
    </AuthLayout>
  )
}
