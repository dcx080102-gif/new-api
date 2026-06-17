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
  createLoginFormSchema,
  createRegisterFormSchema,
  createForgotPasswordFormSchema,
} from '../constants'

// ============================================================================
// Login Form Schema
// ============================================================================

describe('createLoginFormSchema', () => {
  const schema = createLoginFormSchema()

  it('accepts valid login data', () => {
    const result = schema.safeParse({
      username: 'testuser',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty username', () => {
    const result = schema.safeParse({
      username: '',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('username')
    }
  })

  it('rejects empty password', () => {
    const result = schema.safeParse({
      username: 'testuser',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password')
    }
  })

  it('rejects password shorter than 8 characters', () => {
    const result = schema.safeParse({
      username: 'testuser',
      password: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('accepts email as username', () => {
    const result = schema.safeParse({
      username: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Register Form Schema
// ============================================================================

describe('createRegisterFormSchema', () => {
  const schema = createRegisterFormSchema()

  it('accepts valid registration data', () => {
    const result = schema.safeParse({
      username: 'newuser',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = schema.safeParse({
      username: 'newuser',
      password: 'password123',
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmIssue = result.error.issues.find(
        (i) => i.path[0] === 'confirmPassword',
      )
      expect(confirmIssue).toBeDefined()
    }
  })

  it('rejects empty username', () => {
    const result = schema.safeParse({
      username: '',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password over 20 characters', () => {
    const result = schema.safeParse({
      username: 'newuser',
      password: 'a'.repeat(21),
      confirmPassword: 'a'.repeat(21),
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional email field', () => {
    const result = schema.safeParse({
      username: 'newuser',
      password: 'password123',
      confirmPassword: 'password123',
      email: 'user@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional aff_code field', () => {
    const result = schema.safeParse({
      username: 'newuser',
      password: 'password123',
      confirmPassword: 'password123',
      aff_code: 'eowb',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty confirmPassword', () => {
    const result = schema.safeParse({
      username: 'newuser',
      password: 'password123',
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Forgot Password Form Schema
// ============================================================================

describe('createForgotPasswordFormSchema', () => {
  const schema = createForgotPasswordFormSchema()

  it('accepts valid email', () => {
    const result = schema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email format', () => {
    const result = schema.safeParse({ email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects empty email', () => {
    const result = schema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })
})
