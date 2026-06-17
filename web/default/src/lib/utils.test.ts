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
  cn,
  sanitizeCssVariableName,
  getPageNumbers,
  truncateText,
  tryPrettyJson,
  sanitizeHtml,
} from './utils'

// ============================================================================
// cn() — class name merging
// ============================================================================

describe('cn', () => {
  it('合并多个类名', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('过滤掉假值（false/null/undefined）', () => {
    expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar')
  })

  it('合并 Tailwind 冲突类名（twMerge）', () => {
    // p-4 和 p-2 冲突，后者应覆盖前者
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('空入参返回空字符串', () => {
    expect(cn()).toBe('')
  })
})

// ============================================================================
// sanitizeCssVariableName()
// ============================================================================

describe('sanitizeCssVariableName', () => {
  it('将点号替换为连字符', () => {
    expect(sanitizeCssVariableName('gpt-3.5-turbo')).toBe('gpt-3-5-turbo')
  })

  it('将空格替换为连字符', () => {
    expect(sanitizeCssVariableName('hello world')).toBe('hello-world')
  })

  it('删除特殊字符', () => {
    expect(sanitizeCssVariableName('test@#$name')).toBe('testname')
  })

  it('将斜杠替换为连字符', () => {
    expect(sanitizeCssVariableName('a/b/c')).toBe('a-b-c')
  })

  it('纯字母数字不变', () => {
    expect(sanitizeCssVariableName('simpleName123')).toBe('simpleName123')
  })
})

// ============================================================================
// getPageNumbers()
// ============================================================================

describe('getPageNumbers', () => {
  it('总页数 ≤4 时返回全部页码', () => {
    expect(getPageNumbers(1, 3)).toEqual([1, 2, 3])
    expect(getPageNumbers(2, 4)).toEqual([1, 2, 3, 4])
  })

  it('当前页在前部时显示 [1, 2, ..., 总页数]', () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, '...', 10])
    expect(getPageNumbers(2, 10)).toEqual([1, 2, '...', 10])
  })

  it('当前页在后部时显示 [1, ..., 倒数第二, 总页数]', () => {
    expect(getPageNumbers(9, 10)).toEqual([1, '...', 9, 10])
    expect(getPageNumbers(10, 10)).toEqual([1, '...', 9, 10])
  })

  it('当前页在中间时显示 [1, ..., 当前页, ..., 总页数]', () => {
    expect(getPageNumbers(5, 10)).toEqual([1, '...', 5, '...', 10])
  })

  it('单页返回 [1]', () => {
    expect(getPageNumbers(1, 1)).toEqual([1])
  })
})

// ============================================================================
// truncateText()
// ============================================================================

describe('truncateText', () => {
  it('文本长度 ≤ 最大长度时原样返回', () => {
    expect(truncateText('hello', 10)).toBe('hello')
  })

  it('文本长度 > 最大长度时截断并加省略号', () => {
    expect(truncateText('hello world', 5)).toBe('hello...')
  })

  it('空字符串返回空字符串', () => {
    expect(truncateText('', 5)).toBe('')
  })

  it('恰好等于最大长度时原样返回', () => {
    expect(truncateText('hello', 5)).toBe('hello')
  })
})

// ============================================================================
// tryPrettyJson()
// ============================================================================

describe('tryPrettyJson', () => {
  it('格式化有效 JSON 字符串', () => {
    const input = '{"a":1,"b":2}'
    const result = tryPrettyJson(input)
    expect(JSON.parse(result)).toEqual({ a: 1, b: 2 })
    expect(result).toContain('\n')
    expect(result).toContain('  ')
  })

  it('无效 JSON 返回原文', () => {
    expect(tryPrettyJson('not json')).toBe('not json')
  })

  it('空字符串返回空字符串', () => {
    expect(tryPrettyJson('')).toBe('')
  })

  it('null/undefined 返回空字符串', () => {
    // @ts-expect-error 测试边界情况
    expect(tryPrettyJson(null)).toBe('')
    // @ts-expect-error 测试边界情况
    expect(tryPrettyJson(undefined)).toBe('')
  })
})

// ============================================================================
// sanitizeHtml()
// ============================================================================

describe('sanitizeHtml', () => {
  it('移除 script 标签', () => {
    const input = '<div>hello</div><script>alert("xss")</script>'
    // script 标签不应出现在结果中
    expect(sanitizeHtml(input)).not.toContain('script')
    expect(sanitizeHtml(input)).toContain('hello')
  })

  it('移除 onXxx 事件处理器', () => {
    const input = '<div onclick="alert(1)">click</div>'
    expect(sanitizeHtml(input)).not.toContain('onclick')
    expect(sanitizeHtml(input)).toContain('click')
  })

  it('移除 javascript: 伪协议', () => {
    const input = '<a href="javascript:void(0)">link</a>'
    expect(sanitizeHtml(input)).not.toContain('javascript')
    expect(sanitizeHtml(input)).toContain('link')
  })

  it('空字符串返回空字符串', () => {
    expect(sanitizeHtml('')).toBe('')
  })

  it('安全 HTML 原样返回', () => {
    const input = '<div><p>hello world</p></div>'
    expect(sanitizeHtml(input)).toBe(input)
  })
})
