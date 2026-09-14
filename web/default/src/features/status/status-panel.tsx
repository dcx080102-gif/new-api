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
import { cn } from '@/lib/utils'
import { getPerfMetricsSummary } from '@/features/performance-metrics/api'
import {
  formatLatency,
  formatThroughput,
  formatUptimePct,
} from '@/features/performance-metrics/lib/format'
import type {
  PerfModelSummary,
  UptimeInfo,
} from '@/features/performance-metrics/types'
import { getUptimeHistory } from './api'

const SITE_GROUP_NAME = '网站可用性'

type StatusRow = {
  name: string
  uptime: UptimeInfo | null
  perf: PerfModelSummary | null
}

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

function dayBarColor(day: { up: number; total: number }): string {
  if (day.total === 0) return 'bg-muted-foreground/20'
  const pct = (day.up * 100) / day.total
  if (pct >= 99) return 'bg-emerald-500/80'
  if (pct >= 90) return 'bg-amber-500/80'
  return 'bg-red-500/80'
}

// 所有模型性能+可用性平铺总表（公开页与控制台页共用）
export function StatusPanel(props: { showSummary?: boolean }) {
  const { t } = useTranslation()
  const showSummary = props.showSummary !== false

  const perfQuery = useQuery({
    queryKey: ['perf-metrics-summary', 'status'],
    queryFn: () => getPerfMetricsSummary(24),
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  })
  const siteQuery = useQuery({
    queryKey: ['uptime-history'],
    queryFn: getUptimeHistory,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  })

  const rows = useMemo<StatusRow[]>(() => {
    const perfModels = perfQuery.data?.data.models ?? []
    const uptimeModels = perfQuery.data?.data.uptime_models ?? []
    const byName = new Map<string, StatusRow>()
    for (const u of uptimeModels) {
      byName.set(u.model_name, { name: u.model_name, uptime: u.uptime, perf: null })
    }
    for (const p of perfModels) {
      const existing = byName.get(p.model_name)
      if (existing) {
        existing.perf = p
      } else {
        byName.set(p.model_name, { name: p.model_name, uptime: null, perf: p })
      }
    }
    return Array.from(byName.values()).sort((a, b) => {
      const sa = a.uptime?.samples ?? 0
      const sb = b.uptime?.samples ?? 0
      if (sa !== sb) return sb - sa
      return a.name.localeCompare(b.name)
    })
  }, [perfQuery.data])

  const siteGroup = siteQuery.data?.data.groups.find(
    (g) => g.categoryName === SITE_GROUP_NAME
  )
  const siteMonitor = siteGroup?.monitors[0]

  const overall = useMemo(() => {
    let ups = 0
    let samples = 0
    let latencySum = 0
    let latencyCount = 0
    let lastCheck = 0
    for (const row of rows) {
      const u = row.uptime
      if (!u || u.samples <= 0) continue
      ups += Math.round((u.uptime_7d * u.samples) / 100)
      samples += u.samples
      if (u.avg_latency_ms >= 0) {
        latencySum += u.avg_latency_ms
        latencyCount += 1
      }
      if (u.last_check > lastCheck) lastCheck = u.last_check
    }
    return {
      uptime7d: samples > 0 ? (ups * 100) / samples : -1,
      samples,
      avgLatency: latencyCount > 0 ? latencySum / latencyCount : -1,
      lastCheck,
    }
  }, [rows])

  const isLoading = perfQuery.isLoading && rows.length === 0

  return (
    <>
      {showSummary && (
        <div className='mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4'>
          <div className='border-border/60 rounded-xl border bg-background/60 px-4 py-3.5'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <Activity className='size-3.5' aria-hidden='true' />
              {t('7-Day Availability')}
            </div>
            <div className={cn('mt-1.5 text-xl font-bold tabular-nums', uptimeColor(overall.uptime7d))}>
              {formatUptimePct(overall.uptime7d)}
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
              {formatAgoUnix(overall.lastCheck, t)}
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className='text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm'>
          <Loader2 className='size-4 animate-spin' aria-hidden='true' />
          {t('Loading status data...')}
        </div>
      )}

      {!isLoading && perfQuery.isError && rows.length === 0 && (
        <div className='border-border/60 text-muted-foreground rounded-xl border bg-background/60 px-4 py-8 text-center text-sm'>
          {t('Failed to load status data, please try again later.')}
        </div>
      )}

      {!isLoading && rows.length === 0 && !perfQuery.isError && (
        <div className='border-border/60 text-muted-foreground rounded-xl border bg-background/60 px-4 py-8 text-center text-sm'>
          {t(
            'Monitoring data is still being collected. The first results will appear within about 15 minutes.'
          )}
        </div>
      )}

      {rows.length > 0 && (
        <div className='border-border/60 overflow-x-auto rounded-xl border bg-background/60'>
          <table className='w-full min-w-[860px] border-collapse text-[13px]'>
            <thead>
              <tr className='text-muted-foreground border-border/60 border-b text-left text-xs'>
                <th className='px-4 py-3 font-medium'>{t('Model')}</th>
                <th className='px-3 py-3 font-medium'>{t('Status')}</th>
                <th className='px-3 py-3 text-right font-medium'>{t('7-Day Availability')}</th>
                <th className='px-3 py-3 text-right font-medium'>{t('24h Availability')}</th>
                <th className='px-3 py-3 text-right font-medium'>{t('Success rate')}</th>
                <th className='px-3 py-3 text-right font-medium'>{t('Avg. Latency')}</th>
                <th className='px-3 py-3 text-right font-medium'>{t('Average TTFT')}</th>
                <th className='px-3 py-3 text-right font-medium'>TPS</th>
                <th className='px-3 py-3 text-right font-medium'>{t('Samples')}</th>
                <th className='px-3 py-3 text-right font-medium'>{t('Last Check')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const u = row.uptime
                const p = row.perf
                const statusDot =
                  u?.status === 1
                    ? 'bg-emerald-500'
                    : u?.status === 0
                      ? 'bg-red-500'
                      : 'bg-muted-foreground/40'
                const statusText =
                  u?.status === 1
                    ? t('Up')
                    : u?.status === 0
                      ? t('Down')
                      : t('No data')
                // 平均延迟：真实调用性能优先，无流量时用探针延迟
                const latency = p && p.avg_latency_ms > 0 ? p.avg_latency_ms : u?.avg_latency_ms ?? -1
                return (
                  <tr
                    key={row.name}
                    className='border-border/40 border-b transition-colors last:border-b-0 hover:bg-muted/30'
                  >
                    <td className='px-4 py-2.5'>
                      <div className='flex items-center gap-2'>
                        <span className={cn('size-2 shrink-0 rounded-full', statusDot)} aria-hidden='true' />
                        <div className='min-w-0'>
                          <div className='truncate font-mono font-medium'>{row.name}</div>
                          {u && u.daily.length > 0 && (
                            <div
                              className='mt-1 flex items-end gap-[2px]'
                              role='img'
                              aria-label={t('Daily availability over the last 30 days')}
                            >
                              {u.daily.slice(-30).map((day) => (
                                <span
                                  key={day.day}
                                  title={`${day.day}: ${day.up}/${day.total}`}
                                  className={cn('h-2.5 w-[4px] rounded-[1px]', dayBarColor(day))}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='text-muted-foreground px-3 py-2.5 whitespace-nowrap text-xs'>
                      {statusText}
                    </td>
                    <td className={cn('px-3 py-2.5 text-right font-semibold tabular-nums', uptimeColor(u?.uptime_7d ?? -1))}>
                      {u && u.uptime_7d >= 0 ? formatUptimePct(u.uptime_7d) : '—'}
                    </td>
                    <td className={cn('px-3 py-2.5 text-right font-semibold tabular-nums', uptimeColor(u?.uptime_24h ?? -1))}>
                      {u && u.uptime_24h >= 0 ? formatUptimePct(u.uptime_24h) : '—'}
                    </td>
                    <td className='px-3 py-2.5 text-right tabular-nums'>
                      {p ? formatUptimePct(p.success_rate) : '—'}
                    </td>
                    <td className='px-3 py-2.5 text-right tabular-nums'>
                      {formatLatency(latency)}
                    </td>
                    <td className='text-muted-foreground px-3 py-2.5 text-right tabular-nums'>
                      {p && (p.avg_ttft_ms ?? 0) > 0 ? formatLatency(p.avg_ttft_ms ?? 0) : '—'}
                    </td>
                    <td className='px-3 py-2.5 text-right tabular-nums'>
                      {p ? formatThroughput(p.avg_tps) : '—'}
                    </td>
                    <td className='px-3 py-2.5 text-right tabular-nums'>{u?.samples ?? '—'}</td>
                    <td className='text-muted-foreground px-3 py-2.5 text-right whitespace-nowrap text-xs'>
                      {formatAgoUnix(u?.last_check ?? 0, t)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {siteMonitor && (
        <div className='border-border/60 mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border bg-background/60 px-4 py-3'>
          <div className='flex items-center gap-2.5'>
            <span
              className={cn(
                'size-2 rounded-full',
                siteMonitor.status === 1 ? 'bg-emerald-500' : siteMonitor.status === 0 ? 'bg-red-500' : 'bg-muted-foreground/40'
              )}
              aria-hidden='true'
            />
            <span className='text-sm font-medium'>{siteMonitor.name}</span>
            <span className='text-muted-foreground text-xs'>
              {siteMonitor.status === 1
                ? t('Up')
                : siteMonitor.status === 0
                  ? t('Down')
                  : t('No data')}
            </span>
          </div>
          <div className='text-muted-foreground flex flex-wrap items-center gap-x-4 text-xs'>
            <span>
              {t('7-Day Availability')}{' '}
              <span className={cn('font-semibold tabular-nums', uptimeColor(siteMonitor.uptime_7d))}>
                {formatUptimePct(siteMonitor.uptime_7d)}
              </span>
            </span>
            <span>
              {t('Avg. Latency')}{' '}
              <span className='font-semibold'>{formatLatency(siteMonitor.avg_latency_ms)}</span>
            </span>
            <span>
              {t('Last Check')}{' '}
              <span className='font-semibold'>
                {formatAgoUnix(
                  siteMonitor.last_check ? new Date(siteMonitor.last_check).getTime() / 1000 : 0,
                  t
                )}
              </span>
            </span>
          </div>
        </div>
      )}
    </>
  )
}
