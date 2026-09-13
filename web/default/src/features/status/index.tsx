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
import { Activity, Clock, Gauge, Loader2, Radar, WifiOff } from 'lucide-react'
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { cn } from '@/lib/utils'
import { getUptimeHistory } from './api'
import type { UptimeHistoryDaily, UptimeHistoryMonitor } from './api'

const SITE_GROUP_NAME = '网站可用性'

function formatUptime(value: number): string {
  if (value < 0) return '—'
  return `${value.toFixed(1)}%`
}

function formatLatency(ms: number): string {
  if (ms < 0) return '—'
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms)}ms`
}

function formatAgo(
  iso: string | null,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const diffMin = Math.floor((Date.now() - then) / 60000)
  if (diffMin < 1) return t('Just now')
  if (diffMin < 60) return t('{{count}} minutes ago', { count: diffMin })
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return t('{{count}} hours ago', { count: diffHour })
  return t('{{count}} days ago', { count: Math.floor(diffHour / 24) })
}

function uptimeColor(value: number): string {
  if (value < 0) return 'text-muted-foreground'
  if (value >= 99) return 'text-emerald-500'
  if (value >= 95) return 'text-amber-500'
  return 'text-red-500'
}

function dayBarColor(day: UptimeHistoryDaily): string {
  if (day.total === 0) return 'bg-muted-foreground/20'
  const pct = (day.up * 100) / day.total
  if (pct >= 99) return 'bg-emerald-500/80'
  if (pct >= 90) return 'bg-amber-500/80'
  return 'bg-red-500/80'
}

// 近 30 天每日可用率条（Kener 风格）
function DailyBars(props: { daily: UptimeHistoryDaily[] }) {
  const { t } = useTranslation()
  const cells = props.daily.slice(-30)
  if (cells.length === 0) {
    return (
      <span className='text-muted-foreground/60 text-[11px]'>
        {t('Collecting daily data...')}
      </span>
    )
  }
  return (
    <div
      className='flex items-end gap-[2px]'
      role='img'
      aria-label={t('Daily availability over the last 30 days')}
    >
      {cells.map((day) => (
        <span
          key={day.day}
          title={`${day.day}: ${day.up}/${day.total}`}
          className={cn('h-3.5 w-[5px] rounded-[2px]', dayBarColor(day))}
        />
      ))}
    </div>
  )
}

function MonitorCard(props: {
  monitor: UptimeHistoryMonitor
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const m = props.monitor
  const statusDot =
    m.status === 1
      ? 'bg-emerald-500'
      : m.status === 0
        ? 'bg-red-500'
        : 'bg-muted-foreground/40'
  const statusText =
    m.status === 1
      ? props.t('Up')
      : m.status === 0
        ? props.t('Down')
        : props.t('No data')

  return (
    <div className='border-border/60 rounded-xl border bg-background/60 p-4 transition-colors hover:border-border'>
      <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <span className={cn('size-2.5 shrink-0 rounded-full', statusDot)} aria-hidden='true' />
          <span className='truncate font-mono text-sm font-medium'>{m.name}</span>
          <span className='text-muted-foreground shrink-0 text-xs'>{statusText}</span>
        </div>
        <div className='flex flex-wrap items-center gap-x-5 gap-y-1 text-xs'>
          <span className='text-muted-foreground'>
            {props.t('7-Day')}{' '}
            <span className={cn('text-sm font-semibold tabular-nums', uptimeColor(m.uptime_7d))}>
              {formatUptime(m.uptime_7d)}
            </span>
          </span>
          <span className='text-muted-foreground'>
            24h{' '}
            <span className={cn('text-sm font-semibold tabular-nums', uptimeColor(m.uptime))}>
              {formatUptime(m.uptime)}
            </span>
          </span>
          <span className='text-muted-foreground'>
            {props.t('Avg. Latency')}{' '}
            <span className='font-semibold tabular-nums'>{formatLatency(m.avg_latency_ms)}</span>
          </span>
          <span className='text-muted-foreground'>
            {props.t('Last Check')}{' '}
            <span className='font-semibold'>{formatAgo(m.last_check, props.t)}</span>
          </span>
        </div>
      </div>

      <div className='mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5'>
        <div className='flex items-center gap-3 text-[11px]'>
          <DailyBars daily={m.daily} />
        </div>
        <span className='text-muted-foreground/70 text-[11px]'>
          <Radar className='mr-1 inline size-3' aria-hidden='true' />
          {props.t('Active probes')} {m.probe_samples}
          <span className='mx-1.5' aria-hidden='true'>·</span>
          <Activity className='mr-1 inline size-3' aria-hidden='true' />
          {props.t('Live traffic')} {m.log_samples}
          <span className='mx-1.5' aria-hidden='true'>·</span>
          {props.t('Samples')} {m.samples}
        </span>
      </div>
    </div>
  )
}

export function Status() {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['uptime-history'],
    queryFn: getUptimeHistory,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  })

  const groups = query.data?.data?.groups ?? []

  const overall = useMemo(() => {
    let ups = 0
    let samples = 0
    let latencySum = 0
    let latencyCount = 0
    let lastCheck: string | null = null
    for (const group of groups) {
      if (group.categoryName === SITE_GROUP_NAME) continue
      for (const m of group.monitors) {
        if (m.samples <= 0) continue
        ups += Math.round((m.uptime_7d * m.samples) / 100)
        samples += m.samples
        if (m.avg_latency_ms >= 0) {
          latencySum += m.avg_latency_ms
          latencyCount += 1
        }
        if (m.last_check && (!lastCheck || m.last_check > lastCheck)) {
          lastCheck = m.last_check
        }
      }
    }
    return {
      uptime7d: samples > 0 ? (ups * 100) / samples : -1,
      samples,
      avgLatency: latencyCount > 0 ? latencySum / latencyCount : -1,
      lastCheck,
    }
  }, [groups])

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

        {/* 综合统计卡 */}
        <div className='mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4'>
          <div className='border-border/60 rounded-xl border bg-background/60 px-4 py-3.5'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <Activity className='size-3.5' aria-hidden='true' />
              {t('7-Day Availability')}
            </div>
            <div className={cn('mt-1.5 text-xl font-bold tabular-nums', uptimeColor(overall.uptime7d))}>
              {formatUptime(overall.uptime7d)}
            </div>
          </div>
          <div className='border-border/60 rounded-xl border bg-background/60 px-4 py-3.5'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <Gauge className='size-3.5' aria-hidden='true' />
              {t('Total Samples')}
            </div>
            <div className='mt-1.5 text-xl font-bold tabular-nums'>{overall.samples}</div>
          </div>
          <div className='border-border/60 rounded-xl border bg-background/60 px-4 py-3.5'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <Clock className='size-3.5' aria-hidden='true' />
              {t('Avg. Latency')}
            </div>
            <div className='mt-1.5 text-xl font-bold tabular-nums'>
              {formatLatency(overall.avgLatency)}
            </div>
          </div>
          <div className='border-border/60 rounded-xl border bg-background/60 px-4 py-3.5'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <WifiOff className='size-3.5' aria-hidden='true' />
              {t('Last Check')}
            </div>
            <div className='mt-1.5 text-xl font-bold tabular-nums'>
              {formatAgo(overall.lastCheck, t)}
            </div>
          </div>
        </div>

        {query.isLoading && (
          <div className='text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm'>
            <Loader2 className='size-4 animate-spin' aria-hidden='true' />
            {t('Loading status data...')}
          </div>
        )}

        {!query.isLoading && query.isError && (
          <div className='border-border/60 text-muted-foreground rounded-xl border bg-background/60 px-4 py-10 text-center text-sm'>
            {t('Failed to load status data, please try again later.')}
          </div>
        )}

        {!query.isLoading &&
          !query.isError &&
          groups.length === 0 && (
            <div className='border-border/60 text-muted-foreground rounded-xl border bg-background/60 px-4 py-10 text-center text-sm'>
              {t(
                'Monitoring data is still being collected. The first results will appear within about 15 minutes.'
              )}
            </div>
          )}

        {groups.map((group) => (
          <section key={group.categoryName} className='mb-8'>
            <div className='mb-3 flex items-baseline gap-2'>
              <h2 className='text-base font-semibold'>{group.categoryName}</h2>
              <span className='text-muted-foreground/70 text-xs'>
                {group.monitors.length}
              </span>
            </div>
            <div className='space-y-2.5'>
              {group.monitors.map((monitor) => (
                <MonitorCard key={monitor.name} monitor={monitor} t={t} />
              ))}
            </div>
          </section>
        ))}
      </PageTransition>
    </PublicLayout>
  )
}
