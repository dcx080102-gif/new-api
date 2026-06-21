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
import { useMemo, useCallback, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import {
  FILTER_ALL,
  SORT_OPTIONS,
  QUOTA_TYPES,
  ENDPOINT_TYPES,
  CATEGORIES,
  MODEL_SERIES,
  PROTOCOLS,
  QUICK_FILTERS,
  DEFAULT_TOKEN_UNIT,
  VIEW_MODES,
  type ViewMode,
  type Category,
} from '../constants'
import {
  filterAndSortModels,
  filterByCategory,
  extractAllTags,
} from '../lib/filters'
import type { PricingModel, TokenUnit } from '../types'

type FilterState = {
  search?: string
  sort?: string
  vendor?: string
  group?: string
  quotaType?: string
  endpointType?: string
  tag?: string
  series?: string
  protocol?: string
  contextLength?: number
  quickFilter?: string
  category?: Category
  tokenUnit?: TokenUnit
  view?: ViewMode
  rechargePrice?: boolean
}

function normalizeViewMode(value: unknown): ViewMode {
  if (value === VIEW_MODES.TABLE) {
    return VIEW_MODES.TABLE
  }
  return VIEW_MODES.CARD
}

export function useFilters(models: PricingModel[]) {
  const search = useSearch({ from: '/pricing/' }) as Record<string, unknown>
  const [filterState, setFilterState] = useState<FilterState>(() => ({
    search: (search.search as string) || undefined,
    sort: (search.sort as string) || undefined,
    vendor: (search.vendor as string) || undefined,
    group: (search.group as string) || undefined,
    quotaType: (search.quotaType as string) || undefined,
    endpointType: (search.endpointType as string) || undefined,
    tag: (search.tag as string) || undefined,
    series: (search.series as string) || undefined,
    protocol: (search.protocol as string) || undefined,
    contextLength: (search.contextLength as number) || undefined,
    quickFilter: (search.quickFilter as string) || undefined,
    category: (search.category as Category) || undefined,
    tokenUnit: (search.tokenUnit as TokenUnit) || undefined,
    view: (search.view as ViewMode) || undefined,
    rechargePrice: (search.rechargePrice as boolean) || undefined,
  }))

  const searchInput = filterState.search || ''
  const sortBy = filterState.sort || SORT_OPTIONS.NAME
  const vendorFilter = filterState.vendor || FILTER_ALL
  const groupFilter = filterState.group || FILTER_ALL
  const quotaTypeFilter = filterState.quotaType || QUOTA_TYPES.ALL
  const endpointTypeFilter = filterState.endpointType || ENDPOINT_TYPES.ALL
  const tagFilter = filterState.tag || FILTER_ALL
  const seriesFilter = filterState.series || MODEL_SERIES.ALL
  const protocolFilter = filterState.protocol || PROTOCOLS.ALL
  const contextFilter = filterState.contextLength || 0
  const quickFilter = filterState.quickFilter || QUICK_FILTERS.ALL
  const categoryFilter: Category = filterState.category || CATEGORIES.ALL
  const tokenUnit: TokenUnit =
    filterState.tokenUnit === 'K' ? 'K' : DEFAULT_TOKEN_UNIT
  const viewMode = normalizeViewMode(filterState.view)
  const showRechargePrice = filterState.rechargePrice === true

  const updateFilters = useCallback((updates: Record<string, unknown>) => {
    setFilterState((prev) => {
      const next: Record<string, unknown> = { ...prev, ...updates }
      for (const key of Object.keys(next)) {
        if (next[key] === undefined || next[key] === null) {
          delete next[key]
        }
      }
      return next as FilterState
    })
  }, [])

  const setSearchInput = useCallback(
    (v: string) => updateFilters({ search: v || undefined }),
    [updateFilters]
  )
  const setSortBy = useCallback(
    (v: string) =>
      updateFilters({ sort: v === SORT_OPTIONS.NAME ? undefined : v }),
    [updateFilters]
  )
  const setVendorFilter = useCallback(
    (v: string) => updateFilters({ vendor: v === FILTER_ALL ? undefined : v }),
    [updateFilters]
  )
  const setGroupFilter = useCallback(
    (v: string) => updateFilters({ group: v === FILTER_ALL ? undefined : v }),
    [updateFilters]
  )
  const setQuotaTypeFilter = useCallback(
    (v: string) =>
      updateFilters({ quotaType: v === QUOTA_TYPES.ALL ? undefined : v }),
    [updateFilters]
  )
  const setEndpointTypeFilter = useCallback(
    (v: string) =>
      updateFilters({
        endpointType: v === ENDPOINT_TYPES.ALL ? undefined : v,
      }),
    [updateFilters]
  )
  const setTagFilter = useCallback(
    (v: string) => updateFilters({ tag: v === FILTER_ALL ? undefined : v }),
    [updateFilters]
  )
  const setSeriesFilter = useCallback(
    (v: string) =>
      updateFilters({ series: v === MODEL_SERIES.ALL ? undefined : v }),
    [updateFilters]
  )
  const setProtocolFilter = useCallback(
    (v: string) =>
      updateFilters({ protocol: v === PROTOCOLS.ALL ? undefined : v }),
    [updateFilters]
  )
  const setContextFilter = useCallback(
    (v: number) => updateFilters({ contextLength: v <= 0 ? undefined : v }),
    [updateFilters]
  )
  const setQuickFilter = useCallback(
    (v: string) =>
      updateFilters({ quickFilter: v === QUICK_FILTERS.ALL ? undefined : v }),
    [updateFilters]
  )
  const setCategoryFilter = useCallback(
    (v: Category) =>
      updateFilters({ category: v === CATEGORIES.ALL ? undefined : v }),
    [updateFilters]
  )
  const setTokenUnit = useCallback(
    (v: TokenUnit) =>
      updateFilters({ tokenUnit: v === DEFAULT_TOKEN_UNIT ? undefined : v }),
    [updateFilters]
  )
  const setViewMode = useCallback(
    (v: ViewMode) =>
      updateFilters({ view: v === VIEW_MODES.CARD ? undefined : v }),
    [updateFilters]
  )
  const setShowRechargePrice = useCallback(
    (v: boolean) => updateFilters({ rechargePrice: v || undefined }),
    [updateFilters]
  )

  const availableTags = useMemo(() => {
    if (!models || models.length === 0) return []
    return extractAllTags(models)
  }, [models])

  const filteredModels = useMemo(() => {
    if (!models || models.length === 0) return []

    let result = filterAndSortModels(models, {
      search: searchInput,
      vendor: vendorFilter,
      group: groupFilter,
      quotaType: quotaTypeFilter,
      endpointType: endpointTypeFilter,
      tag: tagFilter,
      series: seriesFilter,
      protocol: protocolFilter,
      contextLength: contextFilter,
      quickFilter,
      sortBy,
    })

    // Apply category filter separately (not in filterAndSortModels to avoid breaking existing code)
    result = filterByCategory(result, categoryFilter)

    return result
  }, [
    models,
    searchInput,
    vendorFilter,
    groupFilter,
    quotaTypeFilter,
    endpointTypeFilter,
    tagFilter,
    seriesFilter,
    protocolFilter,
    contextFilter,
    quickFilter,
    categoryFilter,
    sortBy,
  ])

  const hasActiveFilters = useMemo(
    () =>
      vendorFilter !== FILTER_ALL ||
      groupFilter !== FILTER_ALL ||
      quotaTypeFilter !== QUOTA_TYPES.ALL ||
      endpointTypeFilter !== ENDPOINT_TYPES.ALL ||
      tagFilter !== FILTER_ALL ||
      seriesFilter !== MODEL_SERIES.ALL ||
      protocolFilter !== PROTOCOLS.ALL ||
      contextFilter > 0 ||
      quickFilter !== QUICK_FILTERS.ALL,
    [
      vendorFilter,
      groupFilter,
      quotaTypeFilter,
      endpointTypeFilter,
      tagFilter,
      seriesFilter,
      protocolFilter,
      contextFilter,
      quickFilter,
    ]
  )

  const activeFilterCount = useMemo(
    () =>
      (vendorFilter !== FILTER_ALL ? 1 : 0) +
      (groupFilter !== FILTER_ALL ? 1 : 0) +
      (quotaTypeFilter !== QUOTA_TYPES.ALL ? 1 : 0) +
      (endpointTypeFilter !== ENDPOINT_TYPES.ALL ? 1 : 0) +
      (tagFilter !== FILTER_ALL ? 1 : 0) +
      (seriesFilter !== MODEL_SERIES.ALL ? 1 : 0) +
      (protocolFilter !== PROTOCOLS.ALL ? 1 : 0) +
      (contextFilter > 0 ? 1 : 0) +
      (quickFilter !== QUICK_FILTERS.ALL ? 1 : 0),
    [
      vendorFilter,
      groupFilter,
      quotaTypeFilter,
      endpointTypeFilter,
      tagFilter,
      seriesFilter,
      protocolFilter,
      contextFilter,
      quickFilter,
    ]
  )

  const clearFilters = useCallback(() => {
    updateFilters({
      vendor: undefined,
      group: undefined,
      quotaType: undefined,
      endpointType: undefined,
      tag: undefined,
      series: undefined,
      protocol: undefined,
      contextLength: undefined,
      quickFilter: undefined,
    })
  }, [updateFilters])

  const clearSearch = useCallback(() => {
    updateFilters({ search: undefined })
  }, [updateFilters])

  return {
    searchInput,
    sortBy,
    vendorFilter,
    groupFilter,
    quotaTypeFilter,
    endpointTypeFilter,
    tagFilter,
    seriesFilter,
    protocolFilter,
    contextFilter,
    quickFilter,
    categoryFilter,
    tokenUnit,
    viewMode,
    showRechargePrice,
    setSearchInput,
    setSortBy,
    setVendorFilter,
    setGroupFilter,
    setQuotaTypeFilter,
    setEndpointTypeFilter,
    setTagFilter,
    setSeriesFilter,
    setProtocolFilter,
    setContextFilter,
    setQuickFilter,
    setCategoryFilter,
    setTokenUnit,
    setViewMode,
    setShowRechargePrice,
    filteredModels,
    hasActiveFilters,
    activeFilterCount,
    availableTags,
    clearFilters,
    clearSearch,
  }
}
