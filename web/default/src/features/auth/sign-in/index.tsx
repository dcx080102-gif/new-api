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
import { X, AlertTriangle, Zap, Shield, Activity, Coins, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { IconGithub, IconGmail } from '@/assets/brand-icons'
import { cn } from '@/lib/utils'
import { FadeContent } from '@/components/effects/FadeContent'
import { CountUp } from '@/components/effects/CountUp'
import { ShapeBlur } from '@/components/effects/ShapeBlur'
import { useStatus } from '@/hooks/use-status'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'
import { useOAuthLogin } from '../hooks/use-oauth-login'

function BrandPanel() {
  const { t } = useTranslation()

  const features = [
    {
      icon: Activity,
      title: t('99.9% 在线率'),
      desc: t('多节点容灾，服务永不掉线'),
    },
    {
      icon: Zap,
      title: t('极速响应'),
      desc: t('平均延迟低于 80ms，丝滑体验'),
    },
    {
      icon: Shield,
      title: t('企业级安全'),
      desc: t('数据加密隔离，SOC 2 合规'),
    },
    {
      icon: Coins,
      title: t('透明计费'),
      desc: t('用多少付多少，无隐藏费用'),
    },
  ]

  return (
    <FadeContent className='space-y-8 text-center md:text-left' stagger={0.08}>
      {/* Badge */}
      <div className='inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary'>
        <span className='relative flex h-2 w-2'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75' />
          <span className='relative inline-flex h-2 w-2 rounded-full bg-green-500' />
        </span>
        {t('服务运行中')}
      </div>

      {/* Headline */}
      <div className='space-y-3'>
        <h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl'>
          {t('一个 API')}
          <br />
          {t('开启 AI 无限可能')}
        </h1>
        <p className='text-base text-slate-500 dark:text-slate-400'>
          {t('汇聚 40+ AI 大模型，统一接入、统一计费、统一管理')}
        </p>
      </div>

      {/* Feature Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {features.map((f) => (
          <ShapeBlur key={f.title} blur={20} borderRadius='24px'>
            <div
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
          </ShapeBlur>
        ))}
      </div>

      {/* Trust Stat */}
      <div className='flex items-center justify-center gap-6 border-t border-slate-200 pt-6 dark:border-slate-800 md:justify-start'>
        <div className='text-center md:text-left'>
          <p className='text-2xl font-bold text-slate-900 dark:text-white'>
            <CountUp to={128000} suffix='+' />
          </p>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {t('开发者信赖')}
          </p>
        </div>
        <div className='h-10 w-px bg-slate-200 dark:bg-slate-800' />
        <div className='text-center md:text-left'>
          <p className='text-2xl font-bold text-slate-900 dark:text-white'>
            <CountUp to={40} suffix='+' />
          </p>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {t('AI 模型接入')}
          </p>
        </div>
        <div className='h-10 w-px bg-slate-200 dark:bg-slate-800' />
        <div className='text-center md:text-left'>
          <p className='text-2xl font-bold text-slate-900 dark:text-white'>
            <CountUp to={10000000} suffix='+' />
          </p>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {t('日处理请求')}
          </p>
        </div>
      </div>
    </FadeContent>
  )
}

export function SignIn() {
  const { t } = useTranslation()
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const { status } = useStatus()
  const {
    isLoading: oauthLoading,
    handleGitHubLogin,
    handleOIDCLogin,
  } = useOAuthLogin(status)

  const showExpired = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('expired') === 'true'
  }, [])
  const [expiredBannerDismissed, setExpiredBannerDismissed] = useState(false)

  // TODO: 改为 showSocialLogin 按需显示（需要 OAuth 配置）
  // const showSocialLogin = status?.github_oauth || status?.oidc_enabled
  const showSocialLogin = true // 预览模式：始终显示

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
          <h2 className='text-left text-2xl font-semibold tracking-tight'>
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

        {/* Social Login — GitHub & Gmail, left-aligned */}
        {showSocialLogin && (
          <div className='space-y-3'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t border-slate-200 dark:border-slate-800' />
              </div>
              <div className='relative flex justify-start'>
                <span className='bg-slate-50 pr-3 text-xs text-slate-400 dark:bg-slate-950 dark:text-slate-500'>
                  {t('Or continue with')}
                </span>
              </div>
            </div>
            <div className='flex gap-3'>
              {/* GitHub */}
              <Button
                variant='outline'
                type='button'
                disabled={oauthLoading}
                onClick={handleGitHubLogin}
                className={cn(
                  'h-11 flex-1 justify-center gap-2 rounded-lg border-slate-200/80 bg-white/60 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                )}
              >
                {oauthLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <IconGithub className='h-4 w-4' />
                )}
                GitHub
              </Button>
              {/* Gmail */}
              <Button
                variant='outline'
                type='button'
                disabled={oauthLoading}
                onClick={handleOIDCLogin}
                className={cn(
                  'h-11 flex-1 justify-center gap-2 rounded-lg border-slate-200/80 bg-white/60 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                )}
              >
                {oauthLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <IconGmail className='h-4 w-4' />
                )}
                Gmail
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
