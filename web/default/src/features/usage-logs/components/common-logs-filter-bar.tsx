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
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQueryClient, useIsFetching, useQuery } from '@tanstack/react-query'
import { useNavigate, getRouteApi } from '@tanstack/react-router'
import { type Table } from '@tanstack/react-table'
import { Download, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useIsAdmin } from '@/hooks/use-admin'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LOG_TYPE_ALL_VALUE, LOG_TYPE_FILTERS } from '../constants'
import { buildSearchParams } from '../lib/filter'
import { getDefaultTimeRange, downloadCSV, buildApiParams } from '../lib/utils'
import { getAllLogs, getUserLogs } from '../api'
import type { CommonLogFilters } from '../types'
import { CommonLogsStats } from './common-logs-stats'
import { CompactDateTimeRangePicker } from './compact-date-time-range-picker'
import {
  LogsFilterField,
  LogsFilterInput,
  LogsFilterToolbar,
} from './logs-filter-toolbar'
import { useUsageLogsContext } from './usage-logs-provider'

const route = getRouteApi('/_authenticated/usage-logs/$section')
const logTypeValues = ['0', '1', '2', '3', '4', '5', '6'] as const

type LogTypeValue = (typeof logTypeValues)[number]

function isLogTypeValue(value: string): value is LogTypeValue {
  return (logTypeValues as readonly string[]).includes(value)
}

interface CommonLogsFilterBarProps<TData> {
  table: Table<TData>
}

export function CommonLogsFilterBar<TData>(
  props: CommonLogsFilterBarProps<TData>
) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const searchParams = route.useSearch()
  const isAdmin = useIsAdmin()
  const { sensitiveVisible, setSensitiveVisible } = useUsageLogsContext()
  const fetchingLogs = useIsFetching({ queryKey: ['logs'] })

  const [filters, setFilters] = useState<CommonLogFilters>(() => {
    const { start, end } = getDefaultTimeRange()
    return { startTime: start, endTime: end }
  })
  const [logType, setLogType] = useState<LogTypeValue>(LOG_TYPE_ALL_VALUE)

  useEffect(() => {
    const { start, end } = getDefaultTimeRange()
    setFilters({
      startTime: searchParams.startTime
        ? new Date(searchParams.startTime)
        : start,
      endTime: searchParams.endTime ? new Date(searchParams.endTime) : end,
      channel: searchParams.channel || undefined,
      model: searchParams.model || undefined,
      token: searchParams.token || undefined,
      group: searchParams.group || undefined,
      username: searchParams.username || undefined,
      requestId: searchParams.requestId || undefined,
      upstreamRequestId: searchParams.upstreamRequestId || undefined,
    })

    const typeArr = searchParams.type
    const nextLogType =
      Array.isArray(typeArr) &&
      typeArr.length === 1 &&
      isLogTypeValue(typeArr[0])
        ? typeArr[0]
        : LOG_TYPE_ALL_VALUE
    setLogType(nextLogType)
  }, [
    searchParams.startTime,
    searchParams.endTime,
    searchParams.channel,
    searchParams.model,
    searchParams.token,
    searchParams.group,
    searchParams.username,
    searchParams.requestId,
    searchParams.upstreamRequestId,
    searchParams.type,
  ])

  const handleChange = useCallback(
    (field: keyof CommonLogFilters, value: Date | string | undefined) => {
      setFilters((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleApply = useCallback(() => {
    const filterParams = buildSearchParams(filters, 'common')
    navigate({
      to: '/usage-logs/$section',
      params: { section: 'common' },
      search: {
        ...filterParams,
        type: [logType],
        page: 1,
      },
    })
    queryClient.invalidateQueries({ queryKey: ['logs'] })
    queryClient.invalidateQueries({ queryKey: ['usage-logs-stats'] })
  }, [filters, logType, navigate, queryClient])

  const handleReset = useCallback(() => {
    const { start, end } = getDefaultTimeRange()
    const resetFilters: CommonLogFilters = { startTime: start, endTime: end }
    setFilters(resetFilters)
    setLogType(LOG_TYPE_ALL_VALUE)

    navigate({
      to: '/usage-logs/$section',
      params: { section: 'common' },
      search: {
        page: 1,
        type: [LOG_TYPE_ALL_VALUE],
        startTime: start.getTime(),
        endTime: end.getTime(),
      },
    })
    queryClient.invalidateQueries({ queryKey: ['logs'] })
    queryClient.invalidateQueries({ queryKey: ['usage-logs-stats'] })
  }, [navigate, queryClient])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleApply()
    },
    [handleApply]
  )

  // CSV export handler
  const [exporting, setExporting] = useState(false)
  const handleExportCSV = useCallback(async () => {
    setExporting(true)
    try {
      const params = buildApiParams({
        page: 1,
        pageSize: 10000,
        searchParams,
        columnFilters: [],
        isAdmin,
      })
      const result = isAdmin
        ? await getAllLogs(params)
        : await getUserLogs(params)
      if (result.success && result.data?.items?.length) {
        const records = result.data.items as Record<string, unknown>[]
        const dateStr = new Date().toISOString().slice(0, 10)
        downloadCSV(records, `usage-logs-${dateStr}.csv`)
        toast.success(t('CSV exported successfully'))
      } else {
        toast.info(t('No data to export'))
      }
    } catch {
      toast.error(t('Failed to export CSV'))
    } finally {
      setExporting(false)
    }
  }, [searchParams, isAdmin, t])

  // Fetch model names for autocomplete
  const { data: modelNames } = useQuery({
    queryKey: ['usage-logs-model-names', isAdmin],
    queryFn: async () => {
      const now = Date.now()
      const thirtyDaysAgo = now - 30 * 24 * 3600 * 1000
      const params = buildApiParams({
        page: 1,
        pageSize: 200,
        searchParams: {
          startTime: thirtyDaysAgo,
          endTime: now,
        },
        columnFilters: [],
        isAdmin,
      })
      const result = isAdmin
        ? await getAllLogs(params)
        : await getUserLogs(params)
      if (!result.success || !result.data?.items) return []
      const names = new Set<string>()
      for (const item of result.data.items) {
        const name = (item as Record<string, unknown>).model_name as string
        if (name) names.add(name)
      }
      return Array.from(names).sort()
    },
    staleTime: 300000, // 5 min cache
  })

  // Model autocomplete state
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)

  const filteredModelNames = useMemo(() => {
    if (!modelNames || !filters.model) return modelNames || []
    const q = filters.model.toLowerCase()
    return modelNames.filter((name) => name.toLowerCase().includes(q))
  }, [modelNames, filters.model])

  // Close dropdown after a short delay (allow click on dropdown item)
  const handleModelBlur = useCallback(() => {
    setTimeout(() => setModelDropdownOpen(false), 150)
  }, [])

  const handleModelSelect = useCallback(
    (name: string) => {
      handleChange('model', name)
      setModelDropdownOpen(false)
    },
    [handleChange]
  )

  const hasExpandedFilters =
    !!filters.token ||
    !!filters.username ||
    !!filters.channel ||
    !!filters.requestId ||
    !!filters.upstreamRequestId

  const hasTypeFilter = logType !== LOG_TYPE_ALL_VALUE
  const hasAdditionalFilters =
    !!filters.model || !!filters.group || hasTypeFilter || hasExpandedFilters

  const expandedFilterCount = [
    filters.token,
    isAdmin ? filters.username : undefined,
    isAdmin ? filters.channel : undefined,
    filters.requestId,
    filters.upstreamRequestId,
  ].filter(Boolean).length
  const sensitiveType = sensitiveVisible ? 'text' : 'password'
  const logTypeItems = useMemo(
    () =>
      LOG_TYPE_FILTERS.map((type) => ({
        value: type.value,
        label: t(type.label),
      })),
    [t, i18n]
  )
  const logTypeLabel =
    logTypeItems.find((type) => type.value === logType)?.label ?? t('All Types')

  const statsBar = (
    <div className='flex flex-wrap items-center gap-2'>
      <CommonLogsStats />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setSensitiveVisible(!sensitiveVisible)}
              aria-label={sensitiveVisible ? t('Hide') : t('Show')}
              className='text-muted-foreground hover:text-foreground size-7'
            />
          }
        >
          {sensitiveVisible ? <Eye /> : <EyeOff />}
        </TooltipTrigger>
        <TooltipContent>
          {sensitiveVisible ? t('Hide') : t('Show')}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant='outline'
              size='sm'
              onClick={handleExportCSV}
              disabled={exporting}
              className='h-7 gap-1 px-2 text-xs'
            />
          }
        >
          {exporting ? (
            <Loader2 className='size-3 animate-spin' />
          ) : (
            <Download className='size-3' />
          )}
          {t('Export CSV')}
        </TooltipTrigger>
        <TooltipContent>{t('Export current filtered results as CSV')}</TooltipContent>
      </Tooltip>
    </div>
  )

  const dateRangeFilter = (
    <LogsFilterField wide>
      <CompactDateTimeRangePicker
        start={filters.startTime}
        end={filters.endTime}
        onChange={({ start, end }) => {
          handleChange('startTime', start)
          handleChange('endTime', end)
        }}
      />
    </LogsFilterField>
  )
  const modelFilter = (
    <LogsFilterField>
      <div className='relative'>
        <LogsFilterInput
          placeholder={t('Model Name')}
          value={filters.model || ''}
          onChange={(e) => {
            handleChange('model', e.target.value)
            setModelDropdownOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setModelDropdownOpen(false)
              handleApply()
            } else if (e.key === 'Escape') {
              setModelDropdownOpen(false)
            }
          }}
          onFocus={() => setModelDropdownOpen(true)}
          onBlur={handleModelBlur}
        />
        {modelDropdownOpen && filteredModelNames.length > 0 && (
          <div
            className='bg-popover border-border absolute top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border shadow-md'
            onMouseDown={(e) => e.preventDefault()}
          >
            {filteredModelNames.slice(0, 20).map((name) => (
              <button
                key={name}
                type='button'
                className='hover:bg-accent flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm'
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleModelSelect(name)
                }}
              >
                {name === filters.model && (
                  <Check className='size-3.5 shrink-0 text-primary' />
                )}
                <span className={name === filters.model ? '' : 'ml-5.5'}>
                  {name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </LogsFilterField>
  )
  const groupFilter = (
    <LogsFilterField>
      <LogsFilterInput
        placeholder={t('Group')}
        type={sensitiveType}
        value={filters.group || ''}
        onChange={(e) => handleChange('group', e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </LogsFilterField>
  )
  const typeFilter = (
    <LogsFilterField>
      <Select
        items={logTypeItems}
        value={logType}
        onValueChange={(value) => {
          setLogType(
            value !== null && isLogTypeValue(value) ? value : LOG_TYPE_ALL_VALUE
          )
        }}
      >
        <SelectTrigger>
          <SelectValue>{logTypeLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {LOG_TYPE_FILTERS.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {t(type.label)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </LogsFilterField>
  )
  const advancedFilters = (
    <>
      <LogsFilterField>
        <LogsFilterInput
          placeholder={t('Token Name')}
          type={sensitiveType}
          value={filters.token || ''}
          onChange={(e) => handleChange('token', e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </LogsFilterField>
      {isAdmin && (
        <LogsFilterField>
          <LogsFilterInput
            placeholder={t('Username')}
            type={sensitiveType}
            value={filters.username || ''}
            onChange={(e) => handleChange('username', e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </LogsFilterField>
      )}
      {isAdmin && (
        <LogsFilterField>
          <LogsFilterInput
            placeholder={t('Channel ID')}
            value={filters.channel || ''}
            onChange={(e) => handleChange('channel', e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </LogsFilterField>
      )}
      <LogsFilterField>
        <LogsFilterInput
          placeholder={t('Request ID')}
          value={filters.requestId || ''}
          onChange={(e) => handleChange('requestId', e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </LogsFilterField>
      <LogsFilterField>
        <LogsFilterInput
          placeholder={t('Upstream Request ID')}
          value={filters.upstreamRequestId || ''}
          onChange={(e) => handleChange('upstreamRequestId', e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </LogsFilterField>
    </>
  )

  return (
    <LogsFilterToolbar
      table={props.table}
      stats={statsBar}
      primaryFilters={
        <>
          {dateRangeFilter}
          {modelFilter}
          {groupFilter}
          {typeFilter}
        </>
      }
      advancedFilters={advancedFilters}
      mobilePinnedFilters={dateRangeFilter}
      mobileFilters={
        <>
          {modelFilter}
          {groupFilter}
          {typeFilter}
          {advancedFilters}
        </>
      }
      mobileFilterCount={
        [filters.model, filters.group, hasTypeFilter].filter(Boolean).length +
        expandedFilterCount
      }
      hasAdvancedActiveFilters={hasExpandedFilters}
      advancedFilterCount={expandedFilterCount}
      hasActiveFilters={hasAdditionalFilters}
      onSearch={handleApply}
      searchLoading={fetchingLogs > 0}
      onReset={handleReset}
    />
  )
}
