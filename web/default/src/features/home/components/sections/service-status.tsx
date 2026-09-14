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
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Activity, ArrowRight, Clock, Gauge, Radar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPerfMetricsSummary } from '@/features/performance-metrics/api'
import {
  formatLatency,
  formatUptimePct,
} from '@/features/performance-metrics/lib/format'
import type { UptimeInfo, UptimeModel } from '@/features/performance-metrics/types'

function formatAgoUnix(
  unix: number,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  if (!unix || unix <= 0) return '—'
  const diffMin = Math.floor((Date.now() - unix * 1000) / 60000)
  if (diffMin < 1) return t('Just now')
  if (diffMin < 60) return t('{{count}} minutes ago', { count: diffMin })
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return t('{{count}} hours ago', { count: diffHour })
  return t('{{count}} days ago', { count: Math.floor(diffHour / 24) })
}

function uptimeColor(value: number): string {
  if (value < 0) return 'text-muted-foreground'
  if (value >= 99) return 'text-emerald-600 dark:text-emerald-400'
  if (value >= 95) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function UptimeRow(props: {
  item: UptimeModel
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const u: UptimeInfo = props.item.uptime
  const statusDot =
    u.status === 1
      ? 'bg-emerald-500'
      : u.status === 0
        ? 'bg-red-500'
        : 'bg-muted-foreground/40'
  const statusText =
    u.status === 1
      ? props.t('Up')
      : u.status === 0
        ? props.t('Down')
        : props.t('No data')

  return (
    <div className='border-border/60 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border bg-background/60 px-3.5 py-2.5 transition-colors hover:border-border'>
      <div className='flex min-w-0 items-center gap-2.5'>
        <span className={cn('size-2 shrink-0 rounded-full', statusDot)} aria-hidden='true' />
        <span className='truncate font-mono text-sm font-medium'>
          {props.item.model_name}
        </span>
        <span className='text-muted-foreground shrink-0 text-xs'>{statusText}</span>
      </div>
      <div className='flex flex-wrap items-center gap-x-5 gap-y-1 text-xs'>
        <span className='text-muted-foreground'>
          {props.t('7-Day Availability')}{' '}
          <span className={cn('text-sm font-semibold tabular-nums', uptimeColor(u.uptime_7d))}>
            {u.uptime_7d >= 0 ? formatUptimePct(u.uptime_7d) : '—'}
          </span>
        </span>
        <span className='text-muted-foreground'>
          24h{' '}
          <span className={cn('text-sm font-semibold tabular-nums', uptimeColor(u.uptime_24h))}>
            {u.uptime_24h >= 0 ? formatUptimePct(u.uptime_24h) : '—'}
          </span>
        </span>
        <span className='text-muted-foreground'>
          {props.t('Avg. Latency')}{' '}
          <span className='font-semibold tabular-nums'>{formatLatency(u.avg_latency_ms)}</span>
        </span>
        <span className='text-muted-foreground'>
          {props.t('Samples')} <span className='font-semibold'>{u.samples}</span>
        </span>
        <span className='text-muted-foreground'>
          {props.t('Last Check')}{' '}
          <span className='font-semibold'>{formatAgoUnix(u.last_check, props.t)}</span>
        </span>
      </div>
    </div>
  )
}

// 首页「服务状态」区块——复用性能监测数据（/api/perf-metrics/summary 的 uptime_models），
// 公开可见，采集方无需适配新格式。
export function ServiceStatusSection() {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['perf-metrics-summary', 'service-status'],
    queryFn: () => getPerfMetricsSummary(24),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: 2,
  })

  const models = useMemo(() => {
    const items = query.data?.data.uptime_models ?? []
    // 首页只展示样本最多的前 10 个，完整列表在 /status
    return items.slice(0, 10)
  }, [query.data])

  if (models.length === 0) {
    return null
  }

  return (
    <div className='border-border/40 bg-muted/10 relative z-10 border-y'>
      <div className='mx-auto max-w-6xl px-6 py-12 md:py-16'>
        <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <div className='mb-2 flex items-center gap-2'>
              <Radar className='text-primary size-5' aria-hidden='true' />
              <h2 className='text-xl font-bold tracking-tight md:text-2xl'>
                {t('Service Status')}
              </h2>
            </div>
            <p className='text-muted-foreground max-w-xl text-sm'>
              {t('Sampled from active probes and real customer traffic')}
            </p>
          </div>
          <Link
            to='/status'
            className='text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors'
          >
            {t('View full status')}
            <ArrowRight className='size-4' aria-hidden='true' />
          </Link>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='border-border/60 rounded-xl border bg-background/60 px-4 py-3.5'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <Activity className='size-3.5' aria-hidden='true' />
              {t('7-Day Availability')}
            </div>
            <div className='mt-1 text-sm text-muted-foreground/80'>
              {t('All models are monitored around the clock')}
            </div>
          </div>
          <div className='border-border/60 rounded-xl border bg-background/60 px-4 py-3.5'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <Gauge className='size-3.5' aria-hidden='true' />
              {t('Avg. Latency')}
            </div>
            <div className='mt-1 text-sm text-muted-foreground/80'>
              {t('Measured by short probe requests')}
            </div>
          </div>
        </div>

        <div className='mt-4 space-y-2'>
          {models.map((item) => (
            <UptimeRow key={item.model_name} item={item} t={t} />
          ))}
        </div>

        <div className='text-muted-foreground/70 mt-3 flex items-center gap-1.5 text-xs'>
          <Clock className='size-3.5' aria-hidden='true' />
          {t('This page is public and refreshes every minute.')}
        </div>
      </div>
    </div>
  )
}
