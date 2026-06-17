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
  isValidOTP,
  isValidBackupCode,
  formatBackupCode,
  cleanBackupCode,
  isValidEmail,
} from '../lib/validation'

// ============================================================================
// OTP Validation
// ============================================================================

describe('isValidOTP', () => {
  it('returns true for a 6-digit code', () => {
    expect(isValidOTP('123456')).toBe(true)
  })

  it('returns false for codes shorter than 6 digits', () => {
    expect(isValidOTP('12345')).toBe(false)
  })

  it('returns false for codes with letters', () => {
    expect(isValidOTP('abc123')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidOTP('')).toBe(false)
  })

  it('returns false for codes longer than 6 digits', () => {
    expect(isValidOTP('1234567')).toBe(false)
  })
})

// ============================================================================
// Backup Code Validation
// ============================================================================

describe('isValidBackupCode', () => {
  it('returns true for XXXX-XXXX format', () => {
    expect(isValidBackupCode('ABCD-1234')).toBe(true)
  })

  it('returns true for lowercase format', () => {
    expect(isValidBackupCode('abcd-1234')).toBe(true)
  })

  it('returns false for missing hyphen', () => {
    expect(isValidBackupCode('ABCD1234')).toBe(false)
  })

  it('returns false for too short codes', () => {
    expect(isValidBackupCode('ABC-123')).toBe(false)
  })

  it('returns false for special characters', () => {
    expect(isValidBackupCode('ABC@-1234')).toBe(false)
  })
})

describe('formatBackupCode', () => {
  it('inserts hyphen after 4th character', () => {
    expect(formatBackupCode('ABCD1234')).toBe('ABCD-1234')
  })

  it('converts to uppercase', () => {
    expect(formatBackupCode('abcd1234')).toBe('ABCD-1234')
  })

  it('removes non-alphanumeric characters', () => {
    expect(formatBackupCode('AB-CD-12-34')).toBe('ABCD-1234')
  })

  it('truncates to 8 characters', () => {
    expect(formatBackupCode('ABCD123456')).toBe('ABCD-1234')
  })

  it('handles short input without hyphen', () => {
    expect(formatBackupCode('ABC')).toBe('ABC')
  })
})

describe('cleanBackupCode', () => {
  it('removes hyphens', () => {
    expect(cleanBackupCode('ABCD-1234')).toBe('ABCD1234')
  })

  it('handles input without hyphens', () => {
    expect(cleanBackupCode('ABCD1234')).toBe('ABCD1234')
  })
})

// ============================================================================
// Email Validation
// ============================================================================

describe('isValidEmail', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('returns true for email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true)
  })

  it('returns false for email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false)
  })

  it('returns false for email without domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })

  it('returns false for email without TLD', () => {
    expect(isValidEmail('user@example')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('returns false for email with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false)
  })
})
