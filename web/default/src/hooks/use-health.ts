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
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface HealthStatus {
  status: string
  uptime: string
}

export interface ReadyStatus {
  status: string
  postgres?: string
  mysql?: string
  sqlite?: string
  redis?: string
  uptime: string
}

async function fetchHealth(): Promise<HealthStatus> {
  const { data } = await api.get('/health')
  return data as HealthStatus
}

/**
 * useHealth — 轮询服务健康状态
 * 每 30 秒自动刷新，用于前端状态指示器
 */
export function useHealth() {
  const { data, isError } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    // 30 秒轮询
    refetchInterval: 30 * 1000,
    // 3 分钟后数据过期
    staleTime: 3 * 60 * 1000,
    // 缓存 30 分钟
    gcTime: 30 * 60 * 1000,
    // 出错时不重试太多
    retry: 1,
  })

  return {
    /** 服务是否在线 */
    online: data?.status === 'ok',
    /** 运行时间 */
    uptime: data?.uptime ?? '',
    /** 是否正在加载 */
    loading: data === undefined && !isError,
    /** 是否出错 */
    isError,
  }
}
