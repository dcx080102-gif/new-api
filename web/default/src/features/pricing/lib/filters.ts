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
import {
  SORT_OPTIONS,
  FILTER_ALL,
  QUOTA_TYPES,
  QUOTA_TYPE_VALUES,
  ENDPOINT_TYPES,
  CATEGORIES,
  mapEndpointToCategory,
  MODEL_SERIES,
  mapModelToSeries,
  PROTOCOLS,
  type Category,
} from '../constants'
import type { PricingModel } from '../types'
import { getModelContextLength, modelMatchesProtocol } from './model-metadata'
import { getOfficialPrice } from './official-prices'
import { normalizeModelName } from './model-helpers'

// ----------------------------------------------------------------------------
// Filter Utilities
// ----------------------------------------------------------------------------

/**
 * Filter models by search query
 */
export function filterBySearch(
  models: PricingModel[],
  query: string
): PricingModel[] {
  if (!query) return models

  const lowerQuery = query.toLowerCase()
  return models.filter(
    (m) =>
      m.model_name?.toLowerCase().includes(lowerQuery) ||
      normalizeModelName(m.model_name || '').toLowerCase().includes(lowerQuery) ||
      m.description?.toLowerCase().includes(lowerQuery) ||
      m.tags?.toLowerCase().includes(lowerQuery) ||
      m.vendor_name?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Filter models by vendor
 */
export function filterByVendor(
  models: PricingModel[],
  vendor: string
): PricingModel[] {
  if (vendor === FILTER_ALL) return models
  return models.filter((m) => m.vendor_name === vendor)
}

/**
 * Filter models by group
 */
export function filterByGroup(
  models: PricingModel[],
  group: string
): PricingModel[] {
  if (group === FILTER_ALL) return models
  return models.filter((m) => m.enable_groups?.includes(group))
}

/**
 * Filter models by quota type
 */
export function filterByQuotaType(
  models: PricingModel[],
  quotaType: string
): PricingModel[] {
  if (quotaType === QUOTA_TYPES.ALL) return models
  const targetType =
    quotaType === QUOTA_TYPES.TOKEN
      ? QUOTA_TYPE_VALUES.TOKEN
      : QUOTA_TYPE_VALUES.REQUEST
  return models.filter((m) => m.quota_type === targetType)
}

/**
 * Filter models by endpoint type
 */
export function filterByEndpointType(
  models: PricingModel[],
  endpointType: string
): PricingModel[] {
  if (endpointType === ENDPOINT_TYPES.ALL) return models
  return models.filter((m) =>
    m.supported_endpoint_types?.includes(endpointType)
  )
}

/**
 * Get model price for sorting
 */
function getModelPrice(model: PricingModel): number {
  return model.quota_type === 0 ? model.model_ratio : model.model_price || 0
}

/**
 * Sort models by specified option
 */
export function sortModels(
  models: PricingModel[],
  sortBy: string
): PricingModel[] {
  const sorted = [...models]

  switch (sortBy) {
    case SORT_OPTIONS.NAME:
      sorted.sort((a, b) =>
        (a.model_name || '').localeCompare(b.model_name || '')
      )
      break
    case SORT_OPTIONS.PRICE_LOW:
      sorted.sort((a, b) => getModelPrice(a) - getModelPrice(b))
      break
    case SORT_OPTIONS.PRICE_HIGH:
      sorted.sort((a, b) => getModelPrice(b) - getModelPrice(a))
      break
  }

  return sorted
}

/**
 * Apply all filters and sorting to models
 */
export function filterAndSortModels(
  models: PricingModel[],
  filters: {
    search: string
    vendor: string
    group: string
    quotaType: string
    endpointType: string
    tag: string
    series: string
    protocol: string
    contextLength: number
    quickFilter: string
    sortBy: string
  }
): PricingModel[] {
  let result = filterBySearch(models, filters.search)
  result = filterByQuickFilter(result, filters.quickFilter)
  result = filterBySeries(result, filters.series)
  result = filterByVendor(result, filters.vendor)
  result = filterByGroup(result, filters.group)
  result = filterByQuotaType(result, filters.quotaType)
  result = filterByEndpointType(result, filters.endpointType)
  result = filterByTag(result, filters.tag)
  result = filterByProtocol(result, filters.protocol)
  result = filterByContextLength(result, filters.contextLength)
  result = sortModels(result, filters.sortBy)

  return result
}

/**
 * Parse tags from comma-separated string
 */
export function parseTags(tagsString?: string): string[] {
  if (!tagsString) return []
  return tagsString
    .split(/[,;|\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

/**
 * Extract all unique tags from models
 */
export function extractAllTags(models: PricingModel[]): string[] {
  const tagSet = new Set<string>()

  models.forEach((model) => {
    if (model.tags) {
      const tags = parseTags(model.tags)
      tags.forEach((tag) => {
        tagSet.add(tag.toLowerCase())
      })
    }
  })

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
}

/**
 * Filter models by tag
 */
export function filterByTag(
  models: PricingModel[],
  tag: string
): PricingModel[] {
  if (tag === FILTER_ALL) return models

  const tagLower = tag.toLowerCase()
  return models.filter((m) => {
    if (!m.tags) return false
    const modelTags = parseTags(m.tags).map((t) => t.toLowerCase())
    return modelTags.includes(tagLower)
  })
}

/**
 * Filter models by marketplace category.
 * Matches models whose supported_endpoint_types map to the given category.
 */
export function filterByCategory(
  models: PricingModel[],
  category: Category
): PricingModel[] {
  if (category === CATEGORIES.ALL) return models

  return models.filter((m) => {
    const endpoints = m.supported_endpoint_types || []
    return endpoints.some((ep) => mapEndpointToCategory(ep) === category)
  })
}

/**
 * Filter models by model series (GPT / Claude / Gemini / DeepSeek / Qwen).
 */
export function filterBySeries(
  models: PricingModel[],
  series: string
): PricingModel[] {
  if (series === MODEL_SERIES.ALL) return models
  return models.filter((m) => {
    const mapped = mapModelToSeries(m.model_name || '')
    return mapped === series
  })
}

/**
 * Filter models by API protocol (openai / anthropic / gemini).
 */
export function filterByProtocol(
  models: PricingModel[],
  protocol: string
): PricingModel[] {
  if (protocol === PROTOCOLS.ALL) return models
  return models.filter((m) => modelMatchesProtocol(m, protocol))
}

/**
 * Filter models by minimum context window length.
 * Models with unknown context_length (0 or undefined) pass through.
 */
export function filterByContextLength(
  models: PricingModel[],
  minTokens: number
): PricingModel[] {
  if (minTokens <= 0) return models
  return models.filter((m) => {
    const ctx = getModelContextLength(m)
    // Unknown context (0) = show always, otherwise must meet minimum
    return ctx === 0 || ctx >= minTokens
  })
}

/**
 * Filter models by quick filter preset.
 * - hot: Claude / GPT / DeepSeek series
 * - free: model_price = 0 or ratio very low
 * - discount: price lower than official
 */
export function filterByQuickFilter(
  models: PricingModel[],
  quickFilter: string
): PricingModel[] {
  if (quickFilter === 'hot') {
    return models.filter((m) => {
      const series = mapModelToSeries(m.model_name || '')
      return (
        series === MODEL_SERIES.GPT ||
        series === MODEL_SERIES.CLAUDE ||
        series === MODEL_SERIES.DEEPSEEK
      )
    })
  }
  if (quickFilter === 'free') {
    return models.filter((m) => {
      // Token-based: low ratio => very cheap; per-request: price = 0
      if (m.quota_type === 0) return m.model_ratio <= 0.2
      return (m.model_price ?? 0) <= 0.01
    })
  }
  if (quickFilter === 'discount') {
    // Models with known official price where our price is lower
    return models.filter((m) => {
      const official = getOfficialPrice(m.model_name || '')
      if (!official) return false
      const ourAvg = (m.model_ratio + m.completion_ratio) / 2
      const officialAvg = (official.input + official.output) / 2
      return ourAvg < officialAvg
    })
  }
  return models
}
