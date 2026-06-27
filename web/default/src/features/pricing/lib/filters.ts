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
  INPUT_MODALITIES,
  OUTPUT_MODALITIES,
  type Category,
  type InputModality,
  type OutputModality,
} from '../constants'
import type { PricingModel } from '../types'
import { getModelContextLength, modelMatchesProtocol, inferModelMetadata } from './model-metadata'
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
 * Filter models by input modality.
 * Uses inferred input_modalities from model-metadata.
 */
export function filterByInputModality(
  models: PricingModel[],
  modality: InputModality
): PricingModel[] {
  if (modality === INPUT_MODALITIES.ALL) return models
  return models.filter((m) => {
    const meta = inferModelMetadata(m)
    return meta.input_modalities.includes(modality)
  })
}

/**
 * Filter models by output modality.
 * Uses inferred output_modalities from model-metadata.
 */
export function filterByOutputModality(
  models: PricingModel[],
  modality: OutputModality
): PricingModel[] {
  if (modality === OUTPUT_MODALITIES.ALL) return models
  return models.filter((m) => {
    const meta = inferModelMetadata(m)
    return (meta.output_modalities as string[]).includes(modality)
  })
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
    inputModality?: string
    outputModality?: string
  }
): PricingModel[] {
  let result = filterBySearch(models, filters.search)
  result = filterByQuickFilter(result, filters.quickFilter)
  result = filterByInputModality(result, (filters.inputModality || INPUT_MODALITIES.ALL) as InputModality)
  result = filterByOutputModality(result, (filters.outputModality || OUTPUT_MODALITIES.ALL) as OutputModality)
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
    if (endpoints.some((ep) => mapEndpointToCategory(ep) === category)) return true
    // Fallback: name-based matching for models whose endpoints don't reflect video/image
    const name = m.model_name || ''
    if (category === CATEGORIES.VIDEO && /video|sora|veo|kling|pika|grok.*imagine/i.test(name)) return true
    if (category === CATEGORIES.IMAGE && /dall-e|imagen|midjourney|flux|stable.*diffusion/i.test(name)) return true
    return false
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
 * - popular: sort by combined ratio (lower = more popular proxy)
 * - discount: sort by savings percent vs official price (greater discount first)
 * - claude-code: filter Claude series models
 * - codex: filter models with 'codex' in name
 */
export function filterByQuickFilter(
  models: PricingModel[],
  quickFilter: string
): PricingModel[] {
  // 热门：按使用量降序。当前无真实用量API，用"低价=热门"作为代理——ratio越低越多人用
  if (quickFilter === 'popular') {
    return [...models].sort((a, b) => {
      const scoreA = (a.model_ratio || 0) + (a.completion_ratio || 0)
      const scoreB = (b.model_ratio || 0) + (b.completion_ratio || 0)
      return scoreA - scoreB // 越低越靠前
    })
  }

  // 优惠：按比官方便宜的折扣百分比从大到小排序
  if (quickFilter === 'discount') {
    return [...models]
      .map((m) => {
        const official = getOfficialPrice(m.model_name || '')
        if (!official) return { model: m, savings: -1 }
        const ourAvg = ((m.model_ratio || 0) + (m.completion_ratio || 0)) / 2
        const officialAvg = (official.input + official.output) / 2
        if (officialAvg <= 0) return { model: m, savings: -1 }
        const savings = Math.round((1 - ourAvg / officialAvg) * 100)
        return { model: m, savings }
      })
      .sort((a, b) => b.savings - a.savings) // 折扣大的排前面
      .filter((item) => item.savings > 0) // 只保留真有折扣的
      .map((item) => item.model)
  }

  // Claude Code：匹配 Claude 系列模型
  if (quickFilter === 'claude-code') {
    return models.filter((m) => {
      const series = mapModelToSeries(m.model_name || '')
      return series === MODEL_SERIES.CLAUDE
    })
  }

  // Codex：匹配 codex 相关模型
  if (quickFilter === 'codex') {
    return models.filter((m) => {
      const name = (m.model_name || '').toLowerCase()
      return name.includes('codex')
    })
  }

  // FREE：免费模型（model_ratio 为 0 或极低）
  if (quickFilter === 'free') {
    return models.filter((m) => {
      const mr = m.model_ratio ?? 0
      const cr = m.completion_ratio ?? 0
      return mr === 0 && cr === 0
    })
  }

  // Gemini：匹配 Gemini 系列模型
  if (quickFilter === 'gemini') {
    return models.filter((m) => {
      const name = (m.model_name || '').toLowerCase()
      return name.includes('gemini')
    })
  }

  return models
}
