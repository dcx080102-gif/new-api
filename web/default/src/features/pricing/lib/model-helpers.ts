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
import { EXCLUDED_GROUPS, QUOTA_TYPE_VALUES } from '../constants'
import type { PricingModel } from '../types'

// ----------------------------------------------------------------------------
// Model Helper Utilities
// ----------------------------------------------------------------------------

/**
 * Get available groups for a model
 */
export function getAvailableGroups(
  model: PricingModel,
  usableGroup: Record<string, { desc: string; ratio: number }>
): string[] {
  const modelEnableGroups = Array.isArray(model.enable_groups)
    ? model.enable_groups
    : []

  return Object.keys(usableGroup)
    .filter((g) => !EXCLUDED_GROUPS.includes(g))
    .filter((g) => modelEnableGroups.includes(g))
}

/**
 * Replace model placeholder in endpoint path
 */
export function replaceModelInPath(path: string, modelName: string): string {
  return path.replace(/\{model\}/g, modelName)
}

/**
 * Check if model is token-based pricing
 */
export function isTokenBasedModel(model: PricingModel): boolean {
  return model.quota_type === QUOTA_TYPE_VALUES.TOKEN
}

/** Known upstream prefixes that should be stripped for display. */
const UPSTREAM_PREFIXES = ['openai/', 'anthropic/', 'google/', 'meta/', 'cohere/']

/**
 * Strip well-known upstream vendor prefixes from model names for display.
 * e.g. "openai/gpt-4.1" → "gpt-4.1", "anthropic/claude-opus-4-8" → "claude-opus-4-8"
 * The original model_name is preserved for API calls.
 */
export function normalizeModelName(name: string): string {
  const lower = name.toLowerCase()
  for (const prefix of UPSTREAM_PREFIXES) {
    if (lower.startsWith(prefix)) {
      return name.slice(prefix.length)
    }
  }
  return name
}

/**
 * 按模型名智能识别厂商品牌，返回 @lobehub/icons 的图标 key（优先彩色版）。
 * 不依赖后端 vendor 数据，避免厂商配错导致图标错误（如 Claude 显示 OpenAI）。
 * 识别不出时返回 null，由调用方回退到 vendor 图标或首字母。
 */
const BRAND_ICON_RULES: Array<[RegExp, string]> = [
  [/claude/i, 'Claude.Color'],
  [/gpt|chatgpt|davinci|\bo1\b|\bo3\b|\bo4\b|codex|dall-?e|whisper|sora/i, 'OpenAI'],
  [/gemini|palm|bison|gemma/i, 'Gemini.Color'],
  [/deepseek/i, 'DeepSeek.Color'],
  [/qwen|qwq/i, 'Qwen.Color'],
  [/grok/i, 'Grok'],
  [/llama|meta-/i, 'Meta.Color'],
  [/mistral|mixtral|codestral/i, 'Mistral.Color'],
  [/glm|chatglm|zhipu/i, 'Zhipu.Color'],
  [/moonshot|kimi/i, 'Moonshot'],
  [/doubao|seed-/i, 'Doubao.Color'],
  [/ernie|wenxin/i, 'Wenxin.Color'],
  [/\byi-|01-ai/i, 'Yi.Color'],
  [/cohere|command-/i, 'Cohere.Color'],
]

export function getModelBrandIconKey(modelName: string): string | null {
  const name = modelName || ''
  for (const [pattern, iconKey] of BRAND_ICON_RULES) {
    if (pattern.test(name)) return iconKey
  }
  return null
}
