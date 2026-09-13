/* Uptime history API types + fetcher for the public /status page */
import { api } from '@/lib/api'

export interface UptimeHistoryDaily {
  day: string // YYYY-MM-DD
  up: number
  total: number
}

export interface UptimeHistoryMonitor {
  name: string
  status: number // 1=up 0=down -1=no data
  uptime: number // 24h availability %, -1 = insufficient data
  uptime_7d: number // 7d availability %, -1 = insufficient data
  samples: number // 7d total judged samples
  probe_samples: number // active probe samples (7d)
  log_samples: number // real traffic samples (7d)
  avg_latency_ms: number // from probes only, -1 = none
  last_check: string | null
  daily: UptimeHistoryDaily[] // last 30 days
}

export interface UptimeHistoryGroup {
  categoryName: string
  monitors: UptimeHistoryMonitor[]
}

export interface UptimeHistoryResponse {
  success: boolean
  message?: string
  data: {
    generated_at: string
    groups: UptimeHistoryGroup[]
  }
}

export async function getUptimeHistory(): Promise<UptimeHistoryResponse> {
  const res = await api.get<UptimeHistoryResponse>('/api/uptime/history')
  return res.data
}
