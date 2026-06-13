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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { IconGithub } from '@/assets/brand-icons'
import {
  Info,
  Zap,
  Shield,
  Activity,
  Coins,
  Code2,
  Heart,
  Mail,
  ArrowUp,
  Server,
  Database,
  Layers,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { CountUp } from '@/components/effects/CountUp'
import { getAboutContent } from './api'

/* ── 辅助函数 ── */
function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
function isLikelyHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

/* ── 默认关于页内容 ── */
function DefaultAbout() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const [showBackTop, setShowBackTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <PublicLayout showMainContainer={false}>
      {/* ═══ Hero ═══ */}
      <section className='relative overflow-hidden border-b bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950'>
        <div className='absolute inset-0 opacity-[0.03] dark:opacity-[0.06]'
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 30%, #1d4ed8 1px, transparent 1px), radial-gradient(circle at 75% 70%, #1d4ed8 1px, transparent 1px)',
            backgroundSize: '40px 40px, 60px 60px',
          }}
        />
        <div className='container relative mx-auto px-4 py-16 md:py-20'>
          <div className='mx-auto max-w-3xl text-center'>
            <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/50 dark:text-blue-300'>
              <Info className='h-4 w-4' />
              {t('About')}
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl'>
              {t('One API, Unlock Infinite AI Possibilities')}
            </h1>
            <p className='mt-4 text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed'>
              {t('DVLS is an AI API aggregation gateway that provides unified access to 40+ mainstream AI models, enabling developers to manage and call all models from one place — no more switching between platforms.')}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 数据亮点 ═══ */}
      <section className='border-b bg-white dark:bg-slate-950'>
        <div className='container mx-auto px-4 py-12'>
          <div className='mx-auto flex max-w-3xl items-center justify-center gap-8 sm:gap-16'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-slate-900 dark:text-white'>
                <CountUp to={128000} suffix='+' />
              </p>
              <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>{t('Developers Trust')}</p>
            </div>
            <div className='h-12 w-px bg-slate-200 dark:bg-slate-800' />
            <div className='text-center'>
              <p className='text-3xl font-bold text-slate-900 dark:text-white'>
                <CountUp to={40} suffix='+' />
              </p>
              <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>{t('AI Models Connected')}</p>
            </div>
            <div className='h-12 w-px bg-slate-200 dark:bg-slate-800' />
            <div className='text-center'>
              <p className='text-3xl font-bold text-slate-900 dark:text-white'>
                <CountUp to={10000000} suffix='+' />
              </p>
              <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>{t('Daily Requests')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 核心能力 ═══ */}
      <section className='container mx-auto px-4 py-16'>
        <div className='mx-auto max-w-5xl'>
          <div className='mb-10 text-center'>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>{t('Core Capabilities')}</h2>
            <p className='mt-2 text-sm text-slate-500 dark:text-slate-400'>{t('The ultimate API experience built for developers')}</p>
          </div>

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {[
              { icon: Activity, title: t('99.9% Uptime'), desc: t('Multi-node failover, always online') },
              { icon: Zap, title: t('Blazing Fast'), desc: t('Avg latency <80ms, silky smooth') },
              { icon: Shield, title: t('Enterprise Security'), desc: t('Data encryption & isolation, SOC 2 compliant') },
              { icon: Coins, title: t('Transparent Billing'), desc: t('Pay only what you use, no hidden fees') },
            ].map((f) => (
              <div
                key={f.title}
                className='group rounded-2xl border border-slate-200/60 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50'
              >
                <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300'>
                  <f.icon className='h-6 w-6' />
                </div>
                <h3 className='mb-1 text-base font-semibold text-slate-900 dark:text-white'>
                  {f.title}
                </h3>
                <p className='text-sm text-slate-500 dark:text-slate-400'>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 技术栈 ═══ */}
      <section className='border-y bg-slate-50/50 dark:bg-slate-900/30'>
        <div className='container mx-auto px-4 py-16'>
          <div className='mx-auto max-w-4xl'>
            <div className='mb-10 text-center'>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>{t('Tech Architecture')}</h2>
              <p className='mt-2 text-sm text-slate-500 dark:text-slate-400'>{t('Modern tech stack, stable and reliable')}</p>
            </div>

            <div className='grid gap-6 sm:grid-cols-3'>
              <div className='rounded-2xl border border-slate-200/60 bg-white p-6 text-center shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50'>
                <Server className='mx-auto mb-3 h-8 w-8 text-blue-600 dark:text-blue-400' />
                <h3 className='mb-2 font-semibold text-slate-900 dark:text-white'>{t('Backend')}</h3>
                <div className='space-y-1 text-sm text-slate-500 dark:text-slate-400'>
                  <p>{t('Go high-performance service')}</p>
                  <p>{t('RESTful API design')}</p>
                  <p>{t('JWT auth · Multi-tenant isolation')}</p>
                </div>
              </div>
              <div className='rounded-2xl border border-slate-200/60 bg-white p-6 text-center shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50'>
                <Code2 className='mx-auto mb-3 h-8 w-8 text-blue-600 dark:text-blue-400' />
                <h3 className='mb-2 font-semibold text-slate-900 dark:text-white'>{t('Frontend')}</h3>
                <div className='space-y-1 text-sm text-slate-500 dark:text-slate-400'>
                  <p>React 19 · TypeScript</p>
                  <p>Tailwind CSS · shadcn/ui</p>
                  <p>TanStack Router · Query</p>
                </div>
              </div>
              <div className='rounded-2xl border border-slate-200/60 bg-white p-6 text-center shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50'>
                <Database className='mx-auto mb-3 h-8 w-8 text-blue-600 dark:text-blue-400' />
                <h3 className='mb-2 font-semibold text-slate-900 dark:text-white'>{t('Infrastructure')}</h3>
                <div className='space-y-1 text-sm text-slate-500 dark:text-slate-400'>
                  <p>PostgreSQL · Redis</p>
                  <p>{t('Docker containerized deployment')}</p>
                  <p>{t('Multi-node load balancing')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 致谢 ═══ */}
      <section className='container mx-auto px-4 py-16'>
        <div className='mx-auto max-w-3xl text-center'>
          <Heart className='mx-auto mb-4 h-8 w-8 text-red-400' />
          <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>{t('Acknowledgments')}</h2>
          <p className='mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400'>
            {t('This project is based on ')}
            <a
              href='https://github.com/songquanpeng/one-api'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium'
            >
              One API
            </a>
            {' '}{t('(© 2023 JustSong), further developed and maintained by the ')}
            <a
              href='https://github.com/QuantumNous'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium'
            >
              QuantumNous
            </a>
            {' '}{t('team. Thanks to all open source contributors.')}
          </p>

          <div className='mt-8 flex flex-wrap items-center justify-center gap-4'>
            <a
              href='https://github.com/QuantumNous/new-api'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300'
            >
              <IconGithub className='h-4 w-4' />
              {t('GitHub Repository')}
            </a>
            <a
              href='https://github.com/QuantumNous/new-api/blob/main/LICENSE'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-xl border border-blue-200/60 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-blue-800/40 dark:bg-blue-950/50 dark:text-blue-300'
            >
              <Layers className='h-4 w-4' />
              {t('AGPL v3.0 Open Source License')}
            </a>
          </div>
        </div>
      </section>

      {/* ═══ 联系方式 ═══ */}
      <section className='border-t bg-slate-50/50 dark:bg-slate-900/30'>
        <div className='container mx-auto px-4 py-12'>
          <div className='mx-auto max-w-3xl text-center'>
            <Mail className='mx-auto mb-3 h-6 w-6 text-slate-400' />
            <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>{t('Contact Us')}</h2>
            <div className='mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400'>
              <a href='mailto:support@quantumnous.com' className='text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium'>
                support@quantumnous.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 页脚声明 ═══ */}
      <div className='border-t py-6 text-center text-xs text-slate-400 dark:text-slate-600'>
        <p>
          NewAPI © {currentYear} QuantumNous &nbsp;|&nbsp; {t('Based on')} One API © 2023 JustSong &nbsp;|&nbsp; {t('Licensed under AGPL v3.0')}
        </p>
      </div>

      {/* ── 回到顶部 ── */}
      {showBackTop && (
        <button
          type='button'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className='fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800'
          aria-label={t('Back to Top')}
        >
          <ArrowUp className='h-4 w-4 text-slate-600 dark:text-slate-300' />
        </button>
      )}
    </PublicLayout>
  )
}

/* ── 主组件：优先展示后端配置内容，未配置时展示默认关于页 ── */
export function About() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: getAboutContent,
  })

  const rawContent = data?.data?.trim() ?? ''
  const hasContent = rawContent.length > 0
  const isUrl = hasContent && isValidUrl(rawContent)
  const isHtml = hasContent && !isUrl && isLikelyHtml(rawContent)

  // 加载中
  if (isLoading) {
    return (
      <PublicLayout>
        <div className='mx-auto flex max-w-4xl flex-col gap-4 py-12'>
          <Skeleton className='h-8 w-[45%]' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
        </div>
      </PublicLayout>
    )
  }

  // 后端未配置 → 展示默认关于页
  if (!hasContent) {
    return <DefaultAbout />
  }

  // 后端配置了外部链接
  if (isUrl) {
    return (
      <PublicLayout showMainContainer={false}>
        <iframe
          src={rawContent}
          className='h-[calc(100vh-3.5rem)] w-full border-0'
          title={t('About')}
        />
      </PublicLayout>
    )
  }

  // 后端配置了 HTML 或 Markdown
  return (
    <PublicLayout>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        {isHtml ? (
          <div
            className='prose prose-neutral dark:prose-invert max-w-none'
            dangerouslySetInnerHTML={{ __html: rawContent }}
          />
        ) : (
          <Markdown className='prose-neutral dark:prose-invert max-w-none'>
            {rawContent}
          </Markdown>
        )}
      </div>
    </PublicLayout>
  )
}
