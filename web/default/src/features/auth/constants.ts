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
import { z } from 'zod'
import { t } from 'i18next'

// ============================================================================
// Form Schemas (functions for dynamic i18n)
// ============================================================================

export function createLoginFormSchema() {
  return z.object({
    username: z.string().min(1, t('Please enter your username or email')),
    password: z
      .string()
      .min(1, t('Please enter your password'))
      .min(8, t('Password must be at least 8 characters')),
  })
}

export function createRegisterFormSchema() {
  return z
    .object({
      username: z.string().min(1, t('Please enter your username')),
      email: z
        .string()
        .min(1, t('Please enter your email'))
        .email(t('Please enter a valid email address')),
      password: z
        .string()
        .min(1, t('Please enter your password'))
        .min(8, t('Password must be at least 8 characters'))
        .max(20, t('Password must be at most 20 characters')),
      confirmPassword: z.string().min(1, t('Please confirm your password')),
      aff_code: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('Passwords do not match'),
      path: ['confirmPassword'],
    })
}

export function createForgotPasswordFormSchema() {
  return z.object({
    email: z.string().email({
      message: t('Please enter a valid email address'),
    }),
  })
}

export function createOtpFormSchema() {
  return z.object({
    otp: z.string().min(1, t('Please enter the verification code')),
  })
}

// Legacy aliases removed — use createXxxFormSchema() directly in components
// so validation messages follow the current language.

export type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>
export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterFormSchema>>
export type ForgotPasswordFormValues = z.infer<ReturnType<typeof createForgotPasswordFormSchema>>
export type OtpFormValues = z.infer<ReturnType<typeof createOtpFormSchema>>

// ============================================================================
// Validation Constants
// ============================================================================

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 20
export const OTP_LENGTH = 6
export const BACKUP_CODE_LENGTH = 9 // XXXX-XXXX format
export const BACKUP_CODE_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/i
export const OTP_REGEX = /^\d{6}$/

// ============================================================================
// Countdown Constants
// ============================================================================

export const EMAIL_VERIFICATION_COUNTDOWN = 30 // seconds
export const PASSWORD_RESET_COUNTDOWN = 30 // seconds

// ============================================================================
// OAuth Constants
// ============================================================================

export const OAUTH_BIND_STORAGE_KEY = 'oauth:binding:result'
