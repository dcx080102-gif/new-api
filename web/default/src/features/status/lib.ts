/* Shared helpers + data hook for the status panel (public page + console embed) */
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUptimeHistory } from './api'
import type { UptimeHistoryDaily, UptimeHistoryGroup } from './api'

export const SITE_GROUP_NAME = '网站可用性'

export function formatUptime(value: number): string {
  if (value < 0) return '—'
  return `${value.toFixed(1)}%`
}

export function formatLatency(ms: number): string {
  if (ms < 0) return '—'
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms)}ms`
}

export function formatAgo(
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

export function uptimeColor(value: number): string {
  if (value < 0) return 'text-muted-foreground'
  if (value >= 99) return 'text-emerald-500'
  if (value >= 95) return 'text-amber-500'
  return 'text-red-500'
}

export function dayBarColor(day: UptimeHistoryDaily): string {
  if (day.total === 0) return 'bg-muted-foreground/20'
  const pct = (day.up * 100) / day.total
  if (pct >= 99) return 'bg-emerald-500/80'
  if (pct >= 90) return 'bg-amber-500/80'
  return 'bg-red-500/80'
}

export interface UptimeOverall {
  uptime7d: number
  samples: number
  avgLatency: number
  lastCheck: string | null
}

// 综合统计（排除网站可用性分组）
export function computeOverall(groups: UptimeHistoryGroup[]): UptimeOverall {
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
}

// 共享查询（React Query 按 key 去重：公开页与控制台内嵌共用同一份缓存）
export function useUptimeHistoryQuery() {
  return useQuery({
    queryKey: ['uptime-history'],
    queryFn: getUptimeHistory,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  })
}

export function useUptimeOverall(groups: UptimeHistoryGroup[]): UptimeOverall {
  return useMemo(() => computeOverall(groups), [groups])
}
