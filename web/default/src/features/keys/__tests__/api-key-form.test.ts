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
  transformFormDataToPayload,
  transformApiKeyToFormDefaults,
  getApiKeyFormDefaultValues,
  API_KEY_FORM_DEFAULT_VALUES,
} from '../lib/api-key-form'
import type { ApiKey } from '../types'

// ============================================================================
// Form Default Values
// ============================================================================

describe('API_KEY_FORM_DEFAULT_VALUES', () => {
  it('has empty name by default', () => {
    expect(API_KEY_FORM_DEFAULT_VALUES.name).toBe('')
  })

  it('has unlimited_quota set to true', () => {
    expect(API_KEY_FORM_DEFAULT_VALUES.unlimited_quota).toBe(true)
  })

  it('has default remain_quota_dollars of 10', () => {
    expect(API_KEY_FORM_DEFAULT_VALUES.remain_quota_dollars).toBe(10)
  })

  it('has tokenCount of 1', () => {
    expect(API_KEY_FORM_DEFAULT_VALUES.tokenCount).toBe(1)
  })
})

describe('getApiKeyFormDefaultValues', () => {
  it('uses "auto" group when defaultUseAutoGroup is true', () => {
    const defaults = getApiKeyFormDefaultValues(true)
    expect(defaults.group).toBe('auto')
    expect(defaults.cross_group_retry).toBe(true)
  })

  it('uses default group when defaultUseAutoGroup is false', () => {
    const defaults = getApiKeyFormDefaultValues(false)
    expect(defaults.cross_group_retry).toBe(false)
  })
})

// ============================================================================
// Form Data Transformation
// ============================================================================

describe('transformFormDataToPayload', () => {
  it('transforms basic form data to API payload', () => {
    const result = transformFormDataToPayload({
      name: 'My Key',
      remain_quota_dollars: 10,
      expired_time: undefined,
      unlimited_quota: true,
      model_limits: [],
      allow_ips: '',
      group: 'default',
      cross_group_retry: true,
      tokenCount: 1,
    })

    expect(result.name).toBe('My Key')
    expect(result.unlimited_quota).toBe(true)
    expect(result.remain_quota).toBe(0) // unlimited → 0
    expect(result.expired_time).toBe(-1) // undefined → -1
    expect(result.model_limits_enabled).toBe(false)
    expect(result.model_limits).toBe('')
  })

  it('converts expired_time Date to unix timestamp', () => {
    const date = new Date('2026-12-31T23:59:59Z')
    const result = transformFormDataToPayload({
      name: 'Key',
      remain_quota_dollars: 5,
      expired_time: date,
      unlimited_quota: false,
      model_limits: [],
      allow_ips: '',
      group: 'default',
      cross_group_retry: false,
      tokenCount: 1,
    })

    expect(result.expired_time).toBe(Math.floor(date.getTime() / 1000))
  })

  it('converts model_limits array to comma-separated string', () => {
    const result = transformFormDataToPayload({
      name: 'Key',
      remain_quota_dollars: 5,
      expired_time: undefined,
      unlimited_quota: false,
      model_limits: ['gpt-4', 'claude-3'],
      allow_ips: '',
      group: 'default',
      cross_group_retry: false,
      tokenCount: 1,
    })

    expect(result.model_limits).toBe('gpt-4,claude-3')
    expect(result.model_limits_enabled).toBe(true)
  })

  it('handles IP whitelist', () => {
    const result = transformFormDataToPayload({
      name: 'Key',
      remain_quota_dollars: 5,
      expired_time: undefined,
      unlimited_quota: false,
      model_limits: [],
      allow_ips: '192.168.1.1,10.0.0.1',
      group: 'default',
      cross_group_retry: false,
      tokenCount: 1,
    })

    expect(result.allow_ips).toBe('192.168.1.1,10.0.0.1')
  })

  it('disables cross_group_retry when group is not "auto"', () => {
    const result = transformFormDataToPayload({
      name: 'Key',
      remain_quota_dollars: 5,
      expired_time: undefined,
      unlimited_quota: false,
      model_limits: [],
      allow_ips: '',
      group: 'default',
      cross_group_retry: true, // would be true in form but ignored
      tokenCount: 1,
    })

    expect(result.cross_group_retry).toBe(false)
  })

  it('enables cross_group_retry when group is "auto"', () => {
    const result = transformFormDataToPayload({
      name: 'Key',
      remain_quota_dollars: 5,
      expired_time: undefined,
      unlimited_quota: false,
      model_limits: [],
      allow_ips: '',
      group: 'auto',
      cross_group_retry: true,
      tokenCount: 1,
    })

    expect(result.cross_group_retry).toBe(true)
  })

  it('converts remain_quota_dollars when not unlimited', () => {
    const result = transformFormDataToPayload({
      name: 'Key',
      remain_quota_dollars: 10, // $10
      expired_time: undefined,
      unlimited_quota: false,
      model_limits: [],
      allow_ips: '',
      group: 'default',
      cross_group_retry: false,
      tokenCount: 1,
    })

    expect(result.remain_quota).not.toBe(0)
    expect(result.unlimited_quota).toBe(false)
  })
})

// ============================================================================
// Reverse Transformation: API Key → Form
// ============================================================================

describe('transformApiKeyToFormDefaults', () => {
  const mockApiKey: ApiKey = {
    id: 1,
    name: 'Existing Key',
    key: 'sk-xxxx',
    status: 1,
    created_time: 1700000000,
    accessed_time: 1700100000,
    expired_time: 1735689599, // 2026-12-31T23:59:59
    remain_quota: 500000,
    unlimited_quota: false,
    model_limits_enabled: true,
    model_limits: 'gpt-4,claude-3',
    allow_ips: '10.0.0.1',
    group: 'default',
    cross_group_retry: false,
    used_quota: 10000,
  }

  it('transforms API key to form defaults', () => {
    const result = transformApiKeyToFormDefaults(mockApiKey)

    expect(result.name).toBe('Existing Key')
    expect(result.unlimited_quota).toBe(false)
    expect(result.expired_time).toBeInstanceOf(Date)
    expect(result.model_limits).toEqual(['gpt-4', 'claude-3'])
    expect(result.allow_ips).toBe('10.0.0.1')
    expect(result.group).toBe('default')
    expect(result.cross_group_retry).toBe(false)
  })

  it('splits model_limits string into array', () => {
    const apiKey = { ...mockApiKey, model_limits: 'gpt-4,claude-3,gemini' }
    const result = transformApiKeyToFormDefaults(apiKey)
    expect(result.model_limits).toEqual(['gpt-4', 'claude-3', 'gemini'])
  })

  it('handles empty model_limits', () => {
    const apiKey = { ...mockApiKey, model_limits: '' }
    const result = transformApiKeyToFormDefaults(apiKey)
    expect(result.model_limits).toEqual([])
  })

  it('handles expired_time = -1 (never expires)', () => {
    const apiKey = { ...mockApiKey, expired_time: -1 }
    const result = transformApiKeyToFormDefaults(apiKey)
    expect(result.expired_time).toBeUndefined()
  })

  it('sets remain_quota_dollars to 0 when unlimited', () => {
    const apiKey = { ...mockApiKey, unlimited_quota: true, remain_quota: 1000000 }
    const result = transformApiKeyToFormDefaults(apiKey)
    expect(result.remain_quota_dollars).toBe(0)
  })
})
