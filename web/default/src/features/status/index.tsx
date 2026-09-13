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
import { Activity, Clock, Gauge, Loader2, WifiOff } from 'lucide-react'
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { cn } from '@/lib/utils'
import { getUptimeHistory } from './api'
import type { UptimeHistoryMonitor } from './api'

const SITE_GROUP_NAME = '网站可用性'

function formatUptime(value: number): string {
  if (value < 0) return '—'
  return `${value.toFixed(1)}%`
}

function formatLatency(ms: number): string {
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

function MonitorRow(props: { monitor: UptimeHistoryMonitor; t: (key: string, options?: Record<string, unknown>) => string }) {
  const m = props.monitor
  const statusDot =
    m.status === 1
      ? 'bg-emerald-500'
      : m.status === 0
        ? 'bg-red-500'
        : 'bg-muted-foreground/40'
  return (
    <div className='border-border/60 flex flex-col gap-2 rounded-xl border bg-background/60 px-4 py-3 transition-colors hover:border-border sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex min-w-0 items-center gap-3'>
        <span
          className={cn('size-2.5 shrink-0 rounded-full', statusDot)}
          aria-hidden='true'
        />
        <span className='truncate font-mono text-sm font-medium'>{m.name}</span>
        <span className='text-muted-foreground shrink-0 text-xs'>
          {m.status === 1
            ? props.t('Up')
            : m.status === 0
              ? props.t('Down')
              : props.t('No data')}
        </span>
      </div>
      <div className='flex flex-wrap items-center gap-x-5 gap-y-1 text-xs sm:justify-end'>
        <span className='text-muted-foreground'>
          {props.t('7-Day')}{' '}
          <span className={cn('font-semibold', uptimeColor(m.uptime_7d))}>
            {formatUptime(m.uptime_7d)}
          </span>
        </span>
        <span className='text-muted-foreground'>
          24h{' '}
          <span className={cn('font-semibold', uptimeColor(m.uptime))}>
            {formatUptime(m.uptime)}
          </span>
        </span>
        <span className='text-muted-foreground'>
          {props.t('Samples')} <span className='font-semibold'>{m.samples}</span>
        </span>
        <span className='text-muted-foreground'>
          {props.t('Avg. Latency')}{' '}
          <span className='font-semibold'>
            {m.samples > 0 ? formatLatency(m.avg_latency_ms) : '—'}
          </span>
        </span>
        <span className='text-muted-foreground'>
          {props.t('Last Check')}{' '}
          <span className='font-semibold'>{formatAgo(m.last_check, props.t)}</span>
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
        latencySum += m.avg_latency_ms
        latencyCount += 1
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
              'A short message is sent to each model every 15 minutes to verify availability. This page is public and updates automatically every minute.'
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
            <div
              className={cn(
                'mt-1.5 text-xl font-bold tabular-nums',
                uptimeColor(overall.uptime7d)
              )}
            >
              {formatUptime(overall.uptime7d)}
            </div>
          </div>
          <div className='border-border/60 rounded-xl border bg-background/60 px-4 py-3.5'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <Gauge className='size-3.5' aria-hidden='true' />
              {t('Total Samples')}
            </div>
            <div className='mt-1.5 text-xl font-bold tabular-nums'>
              {overall.samples}
            </div>
          </div>
          <div className='border-border/60 rounded-xl border bg-background/60 px-4 py-3.5'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <Clock className='size-3.5' aria-hidden='true' />
              {t('Avg. Latency')}
            </div>
            <div className='mt-1.5 text-xl font-bold tabular-nums'>
              {overall.avgLatency >= 0 ? formatLatency(overall.avgLatency) : '—'}
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
            <div className='mb-3 flex items-center gap-2'>
              <h2 className='text-base font-semibold'>{group.categoryName}</h2>
              <span className='text-muted-foreground/70 text-xs'>
                {group.monitors.length}
              </span>
            </div>
            <div className='space-y-2'>
              {group.monitors.map((monitor) => (
                <MonitorRow key={monitor.name} monitor={monitor} t={t} />
              ))}
            </div>
          </section>
        ))}
      </PageTransition>
    </PublicLayout>
  )
}
