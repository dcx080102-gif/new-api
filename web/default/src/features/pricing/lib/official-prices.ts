/*
 * Official model pricing (USD per 1M tokens) for comparison.
 * Updated manually when official prices change.
 */
export interface OfficialPrice {
  /** USD per 1M input tokens */
  input: number
  /** USD per 1M output tokens */
  output: number
}

const OFFICIAL_PRICES: Record<string, OfficialPrice> = {
  // Anthropic Claude
  'claude-opus-4-8': { input: 15, output: 75 },
  'claude-opus-4-6': { input: 15, output: 75 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-sonnet-4-5': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 1, output: 5 },

  // OpenAI GPT
  'gpt-5.5': { input: 15, output: 60 },
  'gpt-5.4': { input: 5, output: 15 },
  'gpt-5.4-mini': { input: 1.5, output: 6 },
}

/**
 * Get the official price for a model.
 * Returns null if not found in the mapping.
 */
export function getOfficialPrice(modelName: string): OfficialPrice | null {
  return OFFICIAL_PRICES[modelName] ?? null
}

/**
 * Calculate savings percentage: (1 - ourPrice/officialPrice) * 100
 * Returns integer percentage, or null if official price unknown.
 */
export function calcSavingsPct(
  modelName: string,
  ourInputPrice: number,
  ourOutputPrice: number
): number | null {
  const official = getOfficialPrice(modelName)
  if (!official) return null

  // Average price (input + output) for simple comparison
  const ourAvg = (ourInputPrice + ourOutputPrice) / 2
  const officialAvg = (official.input + official.output) / 2

  if (officialAvg <= 0) return null
  const pct = Math.round((1 - ourAvg / officialAvg) * 100)
  return Math.max(0, pct)
}
