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
import { Activity, Clock, Gauge, Loader2, Radar, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  dayBarColor,
  formatAgo,
  formatLatency,
  formatUptime,
  uptimeColor,
  useUptimeHistoryQuery,
  useUptimeOverall,
} from './lib'
import type { UptimeHistoryDaily, UptimeHistoryMonitor } from './api'

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
        <DailyBars daily={m.daily} />
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

// 面板主体（公开页与控制台页共用）
export function StatusPanel(props: { showSummary?: boolean }) {
  const { t } = useTranslation()
  const query = useUptimeHistoryQuery()
  const groups = query.data?.data?.groups ?? []
  const overall = useUptimeOverall(groups)
  const showSummary = props.showSummary !== false

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
      )}

      {query.isLoading && (
        <div className='text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm'>
          <Loader2 className='size-4 animate-spin' aria-hidden='true' />
          {t('Loading status data...')}
        </div>
      )}

      {!query.isLoading && query.isError && (
        <div className='border-border/60 text-muted-foreground rounded-xl border bg-background/60 px-4 py-8 text-center text-sm'>
          {t('Failed to load status data, please try again later.')}
        </div>
      )}

      {!query.isLoading &&
        !query.isError &&
        groups.length === 0 && (
          <div className='border-border/60 text-muted-foreground rounded-xl border bg-background/60 px-4 py-8 text-center text-sm'>
            {t(
              'Monitoring data is still being collected. The first results will appear within about 15 minutes.'
            )}
          </div>
        )}

      {groups.map((group) => (
        <section key={group.categoryName} className='mb-8 last:mb-0'>
          <div className='mb-3 flex items-baseline gap-2'>
            <h2 className='text-base font-semibold'>{group.categoryName}</h2>
            <span className='text-muted-foreground/70 text-xs'>{group.monitors.length}</span>
          </div>
          <div className='space-y-2.5'>
            {group.monitors.map((monitor) => (
              <MonitorCard key={monitor.name} monitor={monitor} t={t} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

