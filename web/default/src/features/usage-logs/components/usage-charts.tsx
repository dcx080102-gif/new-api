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
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { VChart } from '@visactor/react-vchart'
import { BarChart3, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VCHART_OPTION } from '@/lib/vchart'
import { useChartTheme } from '@/lib/use-chart-theme'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsAdmin } from '@/hooks/use-admin'
import { getAllLogs, getUserLogs } from '../api'
import { buildApiParams } from '../lib/utils'

const route = getRouteApi('/_authenticated/usage-logs/$section')

// ============================================================================
// Types
// ============================================================================

interface ChartDataPoint {
  label: string
  value: number
}

interface ChartTab {
  id: string
  labelKey: string
  icon: typeof TrendingUp
}

const CHART_TABS: ChartTab[] = [
  { id: 'trend', labelKey: 'Usage Trend', icon: TrendingUp },
  { id: 'model', labelKey: 'Model Distribution', icon: BarChart3 },
  { id: 'ranking', labelKey: 'User Consumption Ranking', icon: BarChart3 },
] as const

// ============================================================================
// Light/dark palette — per‑chart colour arrays
// ============================================================================

const COLORS_LIGHT = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
]

const COLORS_DARK = [
  '#60a5fa', '#f87171', '#4ade80', '#fbbf24', '#a78bfa',
  '#22d3ee', '#f472b6', '#a3e635', '#fb923c', '#818cf8',
]

// ============================================================================
// Data aggregation helpers
// ============================================================================

function aggregateByDay(
  items: Array<{ created_at: number; quota: number }>
): ChartDataPoint[] {
  const dayMap = new Map<string, number>()

  for (const item of items) {
    const ts = typeof item.created_at === 'number' && item.created_at > 1e12
      ? item.created_at
      : item.created_at * 1000
    const date = new Date(ts)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    dayMap.set(key, (dayMap.get(key) || 0) + (item.quota || 0))
  }

  // Fill in missing days in the 7‑day range
  const result: ChartDataPoint[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    result.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      value: dayMap.get(key) || 0,
    })
  }

  return result
}

function aggregateByModel(
  items: Array<{ model_name: string; quota: number }>
): ChartDataPoint[] {
  const modelMap = new Map<string, number>()

  for (const item of items) {
    const name = item.model_name || 'Unknown'
    modelMap.set(name, (modelMap.get(name) || 0) + (item.quota || 0))
  }

  return Array.from(modelMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

function aggregateByUser(
  items: Array<{ username: string; quota: number }>
): ChartDataPoint[] {
  const userMap = new Map<string, number>()

  for (const item of items) {
    const name = item.username || 'Unknown'
    userMap.set(name, (userMap.get(name) || 0) + (item.quota || 0))
  }

  return Array.from(userMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

// ============================================================================
// VChart spec builders — each returns a spec object for VChart
// ============================================================================

function buildTrendSpec(
  data: ChartDataPoint[],
  dark: boolean,
  textColor: string,
  gridColor: string
) {
  return {
    type: 'line',
    data: {
      values: data.map((d) => ({ date: d.label, quota: d.value })),
    },
    xField: 'date',
    yField: 'quota',
    point: {
      visible: data.length <= 14,
      style: { size: 4, fill: dark ? '#60a5fa' : '#3b82f6' },
    },
    line: {
      style: {
        curveType: 'monotone',
        stroke: dark ? '#60a5fa' : '#3b82f6',
        lineWidth: 2,
      },
    },
    area: {
      visible: true,
      style: {
        fill: {
          gradient: 'linear',
          x0: 0.5,
          y0: 0,
          x1: 0.5,
          y1: 1,
          stops: [
            { offset: 0, color: dark ? 'rgba(96,165,250,0.25)' : 'rgba(59,130,246,0.2)' },
            { offset: 1, color: dark ? 'rgba(96,165,250,0.02)' : 'rgba(59,130,246,0.02)' },
          ],
        } as unknown as string,
      },
    },
    axes: [
      {
        orient: 'bottom',
        type: 'band',
        label: {
          style: { fill: textColor, fontSize: 11, angle: data.length > 10 ? -45 : 0 },
        },
        domainLine: { visible: false },
        tick: { visible: false },
        grid: { visible: false },
      },
      {
        orient: 'left',
        type: 'linear',
        label: {
          style: { fill: textColor, fontSize: 11 },
          formatMethod: (val: number) =>
            val >= 1e6 ? `${(val / 1e6).toFixed(1)}M` : val >= 1e3 ? `${(val / 1e3).toFixed(0)}K` : String(val),
        },
        domainLine: { visible: false },
        tick: { visible: false },
        grid: {
          style: { stroke: gridColor, lineDash: [4, 4] },
        },
      },
    ],
    tooltip: {
      mark: {
        title: {
          value: (datum: { date?: string }) => datum?.date ?? '',
        },
        content: [
          {
            key: 'Quota',
            value: (datum: { quota?: number }) =>
              datum?.quota != null ? datum.quota.toLocaleString() : '0',
          },
        ],
      },
    },
    crosshair: {
      xField: { visible: true, line: { style: { stroke: gridColor, lineDash: [3, 3] } } },
      yField: { visible: false },
    },
  }
}

function buildModelDonutSpec(
  data: ChartDataPoint[],
  dark: boolean,
  textColor: string
) {
  const colors = dark ? COLORS_DARK : COLORS_LIGHT
  return {
    type: 'pie',
    data: {
      values: data.map((d) => ({ model: d.label, value: d.value })),
    },
    categoryField: 'model',
    valueField: 'value',
    radius: 0.82,
    innerRadius: 0.5,
    color: {
      field: 'model',
      type: 'ordinal',
      range: colors,
    },
    label: {
      visible: true,
      formatMethod: (_: unknown, datum: { model?: string; value?: number; percent?: number }) => {
        const pct = datum?.percent != null ? (datum.percent * 100).toFixed(1) : ''
        return pct ? `${pct}%` : ''
      },
      style: {
        fill: textColor,
        fontSize: 11,
      },
    },
    legend: {
      visible: data.length > 0,
      orient: 'right',
      position: 'middle',
      item: {
        label: {
          style: { fill: textColor, fontSize: 11 },
        },
      },
    },
    tooltip: {
      mark: {
        title: {
          value: (datum: { model?: string }) => datum?.model ?? '',
        },
        content: [
          {
            key: 'Quota',
            value: (datum: { value?: number }) =>
              datum?.value != null ? datum.value.toLocaleString() : '0',
          },
          {
            key: 'Percentage',
            value: (datum: { percent?: number }) =>
              datum?.percent != null ? `${(datum.percent * 100).toFixed(1)}%` : '0%',
          },
        ],
      },
    },
  }
}

function buildRankingSpec(
  data: ChartDataPoint[],
  dark: boolean,
  textColor: string,
  gridColor: string
) {
  const colors = dark ? COLORS_DARK : COLORS_LIGHT
  // Reverse data so top user appears at the top of the horizontal bars
  const values = [...data].reverse().map((d, i) => ({
    user: d.label,
    quota: d.value,
    rank: data.length - i,
  }))

  return {
    type: 'bar',
    data: { values },
    xField: 'quota',
    yField: 'user',
    direction: 'horizontal',
    color: {
      field: 'rank',
      type: 'ordinal',
      range: [...colors].reverse().slice(0, data.length),
    },
    bar: {
      style: {
        cornerRadius: [0, 4, 4, 0],
      },
    },
    axes: [
      {
        orient: 'bottom',
        type: 'linear',
        label: {
          style: { fill: textColor, fontSize: 11 },
          formatMethod: (val: number) =>
            val >= 1e6 ? `${(val / 1e6).toFixed(1)}M` : val >= 1e3 ? `${(val / 1e3).toFixed(0)}K` : String(val),
        },
        domainLine: { visible: false },
        tick: { visible: false },
        grid: {
          style: { stroke: gridColor, lineDash: [4, 4] },
        },
      },
      {
        orient: 'left',
        type: 'band',
        label: {
          style: { fill: textColor, fontSize: 11 },
        },
        domainLine: { visible: false },
        tick: { visible: false },
        grid: { visible: false },
      },
    ],
    tooltip: {
      mark: {
        title: {
          value: (datum: { user?: string }) => datum?.user ?? '',
        },
        content: [
          {
            key: 'Quota',
            value: (datum: { quota?: number }) =>
              datum?.quota != null ? datum.quota.toLocaleString() : '0',
          },
        ],
      },
    },
  }
}

// ============================================================================
// Usage Charts Component
// ============================================================================

export function UsageCharts() {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()
  const searchParams = route.useSearch()
  const [activeTab, setActiveTab] = useState<string>('trend')
  const { resolvedTheme, themeReady } = useChartTheme()

  const isDark = resolvedTheme === 'dark'
  const textColor = isDark
    ? 'rgba(255,255,255,0.68)'
    : 'rgba(15,23,42,0.58)'
  const gridColor = isDark
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(15,23,42,0.12)'

  // Fetch log data for charts (separate from table data)
  const { data, isLoading } = useQuery({
    queryKey: ['usage-logs-charts', isAdmin, searchParams],
    queryFn: async () => {
      // Build params for the last 7 days
      const now = Date.now()
      const sevenDaysAgo = now - 7 * 24 * 3600 * 1000

      const params = buildApiParams({
        page: 1,
        pageSize: 1000,
        searchParams: {
          ...searchParams,
          startTime: sevenDaysAgo,
          endTime: now,
          model: undefined, // ignore model filter for broader view
        },
        columnFilters: [],
        isAdmin,
      })

      const result = isAdmin
        ? await getAllLogs(params)
        : await getUserLogs(params)

      if (!result.success || !result.data?.items) {
        return { items: [] }
      }

      return { items: result.data.items as Array<Record<string, unknown>> }
    },
    staleTime: 60000,
    placeholderData: (prev) => prev,
  })

  const items = data?.items ?? []
  const isEmpty = items.length === 0

  // Aggregate data for each chart type
  const trendData = useMemo(
    () => aggregateByDay(items as Array<{ created_at: number; quota: number }>),
    [items]
  )
  const modelData = useMemo(
    () =>
      aggregateByModel(
        items as Array<{ model_name: string; quota: number }>
      ),
    [items]
  )
  const rankingData = useMemo(
    () =>
      aggregateByUser(items as Array<{ username: string; quota: number }>),
    [items]
  )

  // Build specs — only when we have data and theme is ready
  const trendSpec = useMemo(
    () =>
      themeReady && trendData.length > 0
        ? buildTrendSpec(trendData, isDark, textColor, gridColor)
        : null,
    [trendData, isDark, textColor, gridColor, themeReady]
  )

  const modelSpec = useMemo(
    () =>
      themeReady && modelData.length > 0
        ? buildModelDonutSpec(modelData, isDark, textColor)
        : null,
    [modelData, isDark, textColor, themeReady]
  )

  const rankingSpec = useMemo(
    () =>
      themeReady && rankingData.length > 0
        ? buildRankingSpec(rankingData, isDark, textColor, gridColor)
        : null,
    [rankingData, isDark, textColor, gridColor, themeReady]
  )

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className='space-y-3 p-4'>
          <Skeleton className='h-6 w-1/3' />
          <Skeleton className='h-56 w-full rounded-lg' />
        </div>
      )
    }

    if (isEmpty) {
      return (
        <div className='flex flex-col items-center justify-center py-14 text-center'>
          <BarChart3 className='text-muted-foreground/30 size-10' />
          <p className='text-muted-foreground mt-2 text-sm'>{t('No data')}</p>
          <p className='text-muted-foreground/50 mt-1 text-xs'>
            {t('Chart data will appear once usage logs are recorded')}
          </p>
        </div>
      )
    }

    const showPlaceholder =
      (activeTab === 'trend' && !trendSpec) ||
      (activeTab === 'model' && !modelSpec) ||
      (activeTab === 'ranking' && !rankingSpec)

    if (showPlaceholder) {
      return (
        <div className='flex items-center justify-center py-14'>
          <Skeleton className='h-56 w-full rounded-lg' />
        </div>
      )
    }

    const chartHeight = 280

    switch (activeTab) {
      case 'trend':
        return (
          <div className='p-2' style={{ height: chartHeight }}>
            <VChart
              key={`trend-${resolvedTheme}`}
              spec={{
                ...trendSpec,
                theme: isDark ? 'dark' : 'light',
                background: 'transparent',
              }}
              option={VCHART_OPTION}
            />
          </div>
        )
      case 'model':
        return (
          <div className='p-2' style={{ height: chartHeight }}>
            <VChart
              key={`model-${resolvedTheme}`}
              spec={{
                ...modelSpec,
                theme: isDark ? 'dark' : 'light',
                background: 'transparent',
              }}
              option={VCHART_OPTION}
            />
          </div>
        )
      case 'ranking':
        return (
          <div className='p-2' style={{ height: chartHeight }}>
            <VChart
              key={`ranking-${resolvedTheme}`}
              spec={{
                ...rankingSpec,
                theme: isDark ? 'dark' : 'light',
                background: 'transparent',
              }}
              option={VCHART_OPTION}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className='bg-card/50 rounded-lg border'>
      {/* Tab bar */}
      <div className='border-border/60 flex items-center border-b px-3'>
        {CHART_TABS.filter(tab => isAdmin || tab.id !== 'ranking').map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'text-muted-foreground hover:text-foreground relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors',
                activeTab === tab.id &&
                  'text-foreground after:bg-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5'
              )}
            >
              <Icon className='size-3.5' />
              {t(tab.labelKey)}
            </button>
          )
        })}
        {isLoading && (
          <span className='ml-auto'>
            <Skeleton className='h-4 w-16' />
          </span>
        )}
      </div>

      {/* Chart content */}
      <div className='min-h-[180px]'>{renderChart()}</div>
    </div>
  )
}
