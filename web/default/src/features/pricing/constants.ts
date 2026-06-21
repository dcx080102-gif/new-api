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
import { type TFunction } from 'i18next'
import type { TokenUnit } from './types'

// ----------------------------------------------------------------------------
// Pricing Constants
// ----------------------------------------------------------------------------

/** Sort options for pricing models */
export const SORT_OPTIONS = {
  NAME: 'name',
  PRICE_LOW: 'price-low',
  PRICE_HIGH: 'price-high',
} as const

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS]

export function getSortLabels(t: TFunction): Record<SortOption, string> {
  return {
    [SORT_OPTIONS.NAME]: t('Name'),
    [SORT_OPTIONS.PRICE_LOW]: t('Price: Low to High'),
    [SORT_OPTIONS.PRICE_HIGH]: t('Price: High to Low'),
  }
}

/** Filter values */
export const FILTER_ALL = 'all'

/** Quota type options */
export const QUOTA_TYPES = {
  ALL: 'all',
  TOKEN: 'token',
  REQUEST: 'request',
} as const

export type QuotaTypeOption = (typeof QUOTA_TYPES)[keyof typeof QUOTA_TYPES]

/** Quota type labels */
export function getQuotaTypeLabels(
  t: TFunction
): Record<QuotaTypeOption, string> {
  return {
    [QUOTA_TYPES.ALL]: t('All Models'),
    [QUOTA_TYPES.TOKEN]: t('Token-based'),
    [QUOTA_TYPES.REQUEST]: t('Per Request'),
  }
}

/** Endpoint type options */
export const ENDPOINT_TYPES = {
  ALL: 'all',
  OPENAI: 'openai',
  OPENAI_RESPONSE: 'openai-response',
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini',
  JINA_RERANK: 'jina-rerank',
  IMAGE_GENERATION: 'image-generation',
  EMBEDDINGS: 'embeddings',
  OPENAI_VIDEO: 'openai-video',
} as const

export type EndpointTypeOption =
  (typeof ENDPOINT_TYPES)[keyof typeof ENDPOINT_TYPES]

/** Endpoint type labels */
export function getEndpointTypeLabels(
  t: TFunction
): Record<EndpointTypeOption, string> {
  return {
    [ENDPOINT_TYPES.ALL]: t('All Types'),
    [ENDPOINT_TYPES.OPENAI]: 'Chat',
    [ENDPOINT_TYPES.OPENAI_RESPONSE]: 'Response',
    [ENDPOINT_TYPES.ANTHROPIC]: 'Anthropic',
    [ENDPOINT_TYPES.GEMINI]: 'Gemini',
    [ENDPOINT_TYPES.JINA_RERANK]: 'Rerank',
    [ENDPOINT_TYPES.IMAGE_GENERATION]: t('Image'),
    [ENDPOINT_TYPES.EMBEDDINGS]: t('Embeddings'),
    [ENDPOINT_TYPES.OPENAI_VIDEO]: t('Video'),
  }
}

/** Filter section keys */
export const FILTER_SECTIONS = {
  PRICING_TYPE: 'pricingType',
  ENDPOINT_TYPE: 'endpointType',
  VENDOR: 'vendor',
  GROUP: 'group',
  TAG: 'tag',
} as const

/** Maximum number of tags to display in model row */
export const MAX_TAGS_DISPLAY = 5

/** Maximum number of filter items to display before showing "More..." */
export const MAX_FILTER_ITEMS = 5

/** Sidebar width */
export const SIDEBAR_WIDTH = 'w-64'

/** Excluded groups */
export const EXCLUDED_GROUPS = ['', 'auto']

/** Quota type values */
export const QUOTA_TYPE_VALUES = {
  TOKEN: 0,
  REQUEST: 1,
} as const

/** Token unit divisors */
export const TOKEN_UNIT_DIVISORS = {
  M: 1,
  K: 1000,
} as const

/** Default token unit for pricing display */
export const DEFAULT_TOKEN_UNIT: TokenUnit = 'M'

/** View mode options */
export const VIEW_MODES = {
  CARD: 'card',
  TABLE: 'table',
} as const

export type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES]

/** Default page size for pricing table */
export const DEFAULT_PRICING_PAGE_SIZE = 20

// ----------------------------------------------------------------------------
// Model Category (for marketplace-style categorization)
// ----------------------------------------------------------------------------

/** Category filter values for the model marketplace */
export const CATEGORIES = {
  ALL: 'all',
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
} as const

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES]

/** Category labels */
export function getCategoryLabels(t: TFunction): Record<Category, string> {
  return {
    [CATEGORIES.ALL]: t('All'),
    [CATEGORIES.TEXT]: t('Text'),
    [CATEGORIES.IMAGE]: t('Image'),
    [CATEGORIES.AUDIO]: t('Audio'),
    [CATEGORIES.VIDEO]: t('Video'),
  }
}

/**
 * Map endpoint types to categories for marketplace filtering.
 * openai / anthropic / gemini etc. → text
 * image-generation → image
 * tts → audio
 * openai-video → video
 */
export function mapEndpointToCategory(endpoint: string): Category {
  switch (endpoint) {
    case 'image-generation':
      return CATEGORIES.IMAGE
    case 'tts':
    case 'audio':
      return CATEGORIES.AUDIO
    case 'openai-video':
      return CATEGORIES.VIDEO
    default:
      // openai, openai-response, anthropic, gemini, embeddings, jina-rerank, etc.
      return CATEGORIES.TEXT
  }
}

// ----------------------------------------------------------------------------
// Model Series (for marketplace-style series filtering)
// ----------------------------------------------------------------------------

/** Model series filter values */
export const MODEL_SERIES = {
  ALL: 'all',
  GPT: 'gpt',
  CLAUDE: 'claude',
  GEMINI: 'gemini',
  DEEPSEEK: 'deepseek',
  QWEN: 'qwen',
} as const

export type ModelSeries = (typeof MODEL_SERIES)[keyof typeof MODEL_SERIES]

export function getModelSeriesLabels(
  t: TFunction
): Record<ModelSeries, string> {
  return {
    [MODEL_SERIES.ALL]: t('All'),
    [MODEL_SERIES.GPT]: 'GPT',
    [MODEL_SERIES.CLAUDE]: 'Claude',
    [MODEL_SERIES.GEMINI]: 'Gemini',
    [MODEL_SERIES.DEEPSEEK]: 'DeepSeek',
    [MODEL_SERIES.QWEN]: 'Qwen',
  }
}

/**
 * Map model name to its series based on keyword matching.
 */
export function mapModelToSeries(modelName: string): ModelSeries | null {
  if (!modelName) return null
  const lower = modelName.toLowerCase()
  if (lower.includes('gpt')) return MODEL_SERIES.GPT
  if (lower.includes('claude')) return MODEL_SERIES.CLAUDE
  if (lower.includes('gemini')) return MODEL_SERIES.GEMINI
  if (lower.includes('deepseek')) return MODEL_SERIES.DEEPSEEK
  if (lower.includes('qwen')) return MODEL_SERIES.QWEN
  return null
}

/** Icons for model series (LobeHub icon names) */
export const MODEL_SERIES_ICONS: Record<string, string> = {
  [MODEL_SERIES.GPT]: 'OpenAI',
  [MODEL_SERIES.CLAUDE]: 'Anthropic',
  [MODEL_SERIES.GEMINI]: 'Google',
  [MODEL_SERIES.DEEPSEEK]: 'DeepSeek',
  [MODEL_SERIES.QWEN]: 'Qwen',
}

// ----------------------------------------------------------------------------
// API Protocol (for marketplace-style protocol filtering)
// ----------------------------------------------------------------------------

/** API protocol filter values */
export const PROTOCOLS = {
  ALL: 'all',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini',
} as const

export type Protocol = (typeof PROTOCOLS)[keyof typeof PROTOCOLS]

export function getProtocolLabels(t: TFunction): Record<Protocol, string> {
  return {
    [PROTOCOLS.ALL]: t('All'),
    [PROTOCOLS.OPENAI]: 'OpenAI',
    [PROTOCOLS.ANTHROPIC]: 'Anthropic',
    [PROTOCOLS.GEMINI]: 'Gemini',
  }
}

/** Icons for API protocols (LobeHub icon names) */
export const PROTOCOL_ICONS: Record<string, string> = {
  [PROTOCOLS.OPENAI]: 'OpenAI',
  [PROTOCOLS.ANTHROPIC]: 'Anthropic',
  [PROTOCOLS.GEMINI]: 'Google',
}

// ----------------------------------------------------------------------------
// Quick Filters
// ----------------------------------------------------------------------------

/** Quick filter values */
export const QUICK_FILTERS = {
  ALL: 'all',
  POPULAR: 'popular',
  DISCOUNT: 'discount',
  CLAUDE_CODE: 'claude-code',
  CODEX: 'codex',
} as const

export type QuickFilter = (typeof QUICK_FILTERS)[keyof typeof QUICK_FILTERS]

/** Default models per page for card grid */
export const DEFAULT_CARD_PAGE_SIZE = 20
