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
import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatTokens,
  formatUseTime,
  stringToColor,
  formatTimestamp,
} from './format'

// ============================================================================
// formatNumber()
// ============================================================================

describe('formatNumber', () => {
  it('格式化普通数字', () => {
    expect(formatNumber(1234.5678)).toContain('1,234')
  })

  it('null/undefined 返回 "-"', () => {
    expect(formatNumber(null)).toBe('-')
    expect(formatNumber(undefined)).toBe('-')
  })

  it('NaN 返回 "-"', () => {
    expect(formatNumber(NaN)).toBe('-')
  })

  it('整数不显示小数位', () => {
    const result = formatNumber(100)
    // 用 Intl 格式化后不应包含小数点
    expect(result).not.toContain('.')
  })
})

// ============================================================================
// formatCompactNumber()
// ============================================================================

describe('formatCompactNumber', () => {
  it('null/undefined 返回 "-"', () => {
    expect(formatCompactNumber(null)).toBe('-')
    expect(formatCompactNumber(undefined)).toBe('-')
  })

  it('大数字使用紧凑格式', () => {
    // 1234 → ~"1.2K" 之类
    const result = formatCompactNumber(1234)
    expect(result.length).toBeLessThanOrEqual(4)
  })
})

// ============================================================================
// formatPercent()
// ============================================================================

describe('formatPercent', () => {
  it('null/undefined 返回 "-"', () => {
    expect(formatPercent(null)).toBe('-')
    expect(formatPercent(undefined)).toBe('-')
  })

  it('50 输出 50%', () => {
    const result = formatPercent(50)
    expect(result).toContain('50')
  })

  it('0 输出 0%', () => {
    const result = formatPercent(0)
    expect(result).toContain('0')
  })
})

// ============================================================================
// formatTokens()
// ============================================================================

describe('formatTokens', () => {
  it('0 返回 "-"', () => {
    expect(formatTokens(0)).toBe('-')
  })

  it('< 1000 直接显示数字', () => {
    expect(formatTokens(500)).toBe('500')
  })

  it('≥ 1000 且 < 100万显示 K', () => {
    expect(formatTokens(1500)).toBe('1.5K')
    expect(formatTokens(999999)).toBe('1000.0K')
  })

  it('≥ 100万显示 M', () => {
    expect(formatTokens(1500000)).toBe('1.50M')
  })
})

// ============================================================================
// formatUseTime()
// ============================================================================

describe('formatUseTime', () => {
  it('< 60 秒显示秒数', () => {
    const result = formatUseTime(30.5)
    expect(result).toBe('30.5s')
  })

  it('≥ 60 秒显示分钟+秒', () => {
    const result = formatUseTime(95)
    expect(result).toContain('m')
    expect(result).toContain('s')
  })

  it('整分钟', () => {
    const result = formatUseTime(120)
    expect(result).toBe('2m 0s')
  })
})

// ============================================================================
// stringToColor()
// ============================================================================

describe('stringToColor', () => {
  it('返回有效的 HSL 颜色字符串', () => {
    const color = stringToColor('test')
    expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
  })

  it('空字符串返回 "gray"', () => {
    expect(stringToColor('')).toBe('gray')
  })

  it('相同输入返回相同颜色', () => {
    expect(stringToColor('hello')).toBe(stringToColor('hello'))
  })

  it('不同输入大概率返回不同颜色', () => {
    // hash 冲突理论上可能但概率极低
    expect(stringToColor('hello')).not.toBe(stringToColor('world'))
  })
})

// ============================================================================
// formatTimestamp()
// ============================================================================

describe('formatTimestamp', () => {
  it('-1 返回 "Never"', () => {
    expect(formatTimestamp(-1)).toBe('Never')
  })

  it('时间戳格式化为日期字符串', () => {
    // 使用固定时间戳 2025-01-01 12:00:00 UTC
    const timestamp = 1735689600 // 2025-01-01 00:00:00 UTC
    const result = formatTimestamp(timestamp)
    // 应该包含日期格式
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
  })
})
