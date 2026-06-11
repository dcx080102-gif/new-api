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
import { useEffect, useMemo, useState } from 'react'
import type { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Check, Loader2, LogIn, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  buildAssertionResult,
  prepareCredentialRequestOptions,
  isPasskeySupported as detectPasskeySupport,
} from '@/lib/passkey'
import { cn } from '@/lib/utils'
import { useStatus } from '@/hooks/use-status'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog } from '@/components/dialog'
import { PasswordInput } from '@/components/password-input'
import { Turnstile } from '@/components/turnstile'
import { login, wechatLoginByCode } from '@/features/auth/api'
import { LegalConsent } from '@/features/auth/components/legal-consent'
import { OAuthProviders } from '@/features/auth/components/oauth-providers'
import { loginFormSchema } from '@/features/auth/constants'
import { useAuthRedirect } from '@/features/auth/hooks/use-auth-redirect'
import { useTurnstile } from '@/features/auth/hooks/use-turnstile'
import { beginPasskeyLogin, finishPasskeyLogin } from '@/features/auth/passkey'
import type { AuthFormProps } from '@/features/auth/types'

function getPasswordStrength(password: string): {
  level: number
  color: string
  labelKey: string
} {
  if (!password) return { level: 0, color: '', labelKey: '' }
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  // 计算字符类型数
  let types = 0
  if (hasUpper) types++
  if (hasLower) types++
  if (hasDigit) types++
  if (hasSpecial) types++

  // Level 3: 包含全部4种（大写+小写+数字+符号）
  if (types >= 4) {
    return { level: 3, color: 'bg-green-500', labelKey: '安全' }
  }
  // Level 2: 英文 + 至少一种其他类型（数字/符号/大写）, 即2-3种
  if (types >= 2) {
    return { level: 2, color: 'bg-yellow-500', labelKey: '中等' }
  }
  // Level 1: 只有英文字母
  return { level: 1, color: 'bg-red-500', labelKey: '不安全' }
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: AuthFormProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [wechatCode, setWeChatCode] = useState('')
  const [agreedToLegal, setAgreedToLegal] = useState(false)
  const [passkeySupported, setPasskeySupported] = useState(false)
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false)
  const [isWeChatDialogOpen, setIsWeChatDialogOpen] = useState(false)
  const [isWeChatSubmitting, setIsWeChatSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('remember_me') === 'true'
    } catch {
      return false
    }
  })
  const [formMounted, setFormMounted] = useState(false)
  const legalConsentErrorMessage = t('Please agree to the legal terms first')
  const loginFailedMessage = t('Login failed')

  const { status } = useStatus()
  const passkeyLoginEnabled = Boolean(
    status?.passkey_login ?? status?.data?.passkey_login
  )
  const passwordLoginEnabled =
    (status?.password_login_enabled ??
      status?.data?.password_login_enabled ??
      true) !== false
  const {
    isTurnstileEnabled,
    turnstileSiteKey,
    turnstileToken,
    setTurnstileToken,
    validateTurnstile,
  } = useTurnstile()
  const { handleLoginSuccess, redirectTo2FA } = useAuthRedirect()

  const hasUserAgreement = Boolean(status?.user_agreement_enabled)
  const hasPrivacyPolicy = Boolean(status?.privacy_policy_enabled)
  const requiresLegalConsent = hasUserAgreement || hasPrivacyPolicy
  const passkeyButtonDisabled =
    isPasskeyLoading ||
    !passkeySupported ||
    (requiresLegalConsent && !agreedToLegal)
  const hasWeChatLogin = Boolean(status?.wechat_login)
  const hasOAuthLogin = Boolean(
    status?.github_oauth ||
    status?.discord_oauth ||
    status?.oidc_enabled ||
    status?.linuxdo_oauth ||
    status?.telegram_oauth ||
    (status?.custom_oauth_providers?.length ?? 0) > 0
  )
  const hasAlternativeLogin =
    passkeyLoginEnabled || hasWeChatLogin || hasOAuthLogin

  useEffect(() => {
    if (requiresLegalConsent) {
      setAgreedToLegal(false)
    } else {
      setAgreedToLegal(true)
    }
  }, [requiresLegalConsent])

  useEffect(() => {
    detectPasskeySupport()
      .then(setPasskeySupported)
      .catch(() => setPasskeySupported(false))
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFormMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onBlur',
  })

  const passwordValue = form.watch('password')
  const usernameValue = form.watch('username')
  const passwordStrength = getPasswordStrength(passwordValue || '')

  const wechatQrCodeUrl = useMemo(() => {
    return (
      status?.wechat_qrcode ||
      status?.wechat_qr_code ||
      status?.wechat_qrcode_image_url ||
      status?.wechat_qr_code_image_url ||
      status?.wechat_account_qrcode_image_url ||
      status?.WeChatAccountQRCodeImageURL ||
      status?.data?.wechat_qrcode ||
      status?.data?.WeChatAccountQRCodeImageURL ||
      ''
    )
  }, [status])

  async function onSubmit(data: z.infer<typeof loginFormSchema>) {
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(legalConsentErrorMessage)
      return
    }

    if (!validateTurnstile()) return

    if (isLoading) return

    setIsLoading(true)
    try {
      const res = await login({
        username: data.username,
        password: data.password,
        turnstile: turnstileToken,
      })

      if (res.success) {
        if (res.data?.require_2fa) {
          redirectTo2FA()
          return
        }

        await handleLoginSuccess(res.data as { id?: number } | null, redirectTo)
        toast.success(t('Welcome back!'))
      }
    } catch (_error) {
      // Errors are handled by global interceptor
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenWeChatDialog = () => {
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(legalConsentErrorMessage)
      return
    }

    setIsWeChatDialogOpen(true)
  }

  const handleWeChatDialogChange = (open: boolean) => {
    setIsWeChatDialogOpen(open)
    if (!open) {
      setWeChatCode('')
      setIsWeChatSubmitting(false)
    }
  }

  async function handleWeChatLogin() {
    if (!wechatCode.trim()) {
      toast.error(t('Please enter the verification code'))
      return
    }

    setIsWeChatSubmitting(true)
    try {
      const res = await wechatLoginByCode(wechatCode)
      if (res?.success) {
        await handleLoginSuccess(res.data as { id?: number } | null, redirectTo)
        toast.success(t('Signed in via WeChat'))
        handleWeChatDialogChange(false)
      } else {
        toast.error(res?.message || loginFailedMessage)
      }
    } catch (_error) {
      toast.error(loginFailedMessage)
    } finally {
      setIsWeChatSubmitting(false)
    }
  }

  async function handlePasskeyLogin() {
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(legalConsentErrorMessage)
      return
    }

    if (!passkeySupported) {
      toast.error(t('Passkey is not supported on this device'))
      return
    }

    if (!navigator?.credentials) {
      toast.error(t('Passkey is not available in this browser'))
      return
    }

    setIsPasskeyLoading(true)
    try {
      const begin = await beginPasskeyLogin()
      if (!begin.success) {
        throw new Error(begin.message || t('Failed to start Passkey login'))
      }

      const publicKey = prepareCredentialRequestOptions(
        begin.data?.options ?? begin.data
      )

      const credential = (await navigator.credentials.get({
        publicKey,
      })) as PublicKeyCredential | null

      if (!credential) {
        toast.info(t('Passkey login was cancelled'))
        return
      }

      const assertion = buildAssertionResult(credential)
      if (!assertion) {
        throw new Error(t('Invalid Passkey response'))
      }

      const finish = await finishPasskeyLogin(assertion)
      if (!finish.success) {
        throw new Error(finish.message || t('Failed to complete Passkey login'))
      }

      if (!finish.data) {
        throw new Error(t('Missing user data from Passkey login response'))
      }

      await handleLoginSuccess(
        finish.data as { id?: number } | null,
        redirectTo
      )
      toast.success(t('Signed in with Passkey'))
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.info(t('Passkey login was cancelled or timed out'))
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(t('Passkey login failed'))
      }
    } finally {
      setIsPasskeyLoading(false)
    }
  }

  const isOAuthDisabled = isLoading || (requiresLegalConsent && !agreedToLegal)

  const alternativeLoginMethods = (
    <>
      {passkeyLoginEnabled && (
        <div className='mt-2 space-y-1'>
          <Button
            type='button'
            variant='outline'
            disabled={passkeyButtonDisabled}
            onClick={handlePasskeyLogin}
            className='h-11 w-full justify-center gap-2 rounded-lg'
            aria-label={t('Sign in with Passkey')}
            aria-busy={isPasskeyLoading}
          >
            {isPasskeyLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <KeyRound className='h-4 w-4' />
            )}
            {t('Sign in with Passkey')}
          </Button>
          {!passkeySupported && (
            <p className='text-muted-foreground text-xs'>
              {t('Passkey is not supported on this device.')}
            </p>
          )}
        </div>
      )}

      {/* OAuth Providers */}
      <div role='group' aria-label={t('Third-party login providers')}>
        <div className='relative'>
          <OAuthProviders
            status={status}
            disabled={isOAuthDisabled}
            onWeChatLogin={hasWeChatLogin ? handleOpenWeChatDialog : undefined}
            isWeChatLoading={isWeChatSubmitting}
          />
        </div>
      </div>
    </>
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        <div
          className={cn(
            'transition-all duration-500 ease-out',
            formMounted
              ? 'translate-y-0 opacity-100'
              : 'translate-y-3 opacity-0'
          )}
        >
          {hasAlternativeLogin && alternativeLoginMethods}
          {/* Or divider between alternative login and password */}
          {hasAlternativeLogin && passwordLoginEnabled && (
            <div className='relative mb-2 mt-3'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs'>
                <span className='bg-background text-muted-foreground px-2 font-medium'>
                  {t('Or')}
                </span>
              </div>
            </div>
          )}

          {passwordLoginEnabled && (
            <>
              {/* Username Field */}
              <FormField
                control={form.control}
                name='username'
                render={({ field, fieldState }) => {
                  const isValidUsername =
                    fieldState.isTouched &&
                    !fieldState.invalid &&
                    (usernameValue || '').trim().length > 0
                  return (
                    <FormItem>
                      <FormLabel>{t('Username or Email')}</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            placeholder={t('Enter your username or email')}
                            autoFocus
                            autoComplete='username'
                            aria-label={t('Username or Email')}
                            className={cn(
                              isValidUsername &&
                                'border-green-500 pr-8 focus-visible:border-green-500'
                            )}
                            {...field}
                          />
                          {isValidUsername && (
                            <Check className='pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500' />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage role='alert' />
                    </FormItem>
                  )
                }}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name='password'
                render={({ field, fieldState }) => (
                  <FormItem className='relative mt-3'>
                    <FormLabel>{t('Password')}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={t('Enter password')}
                        autoComplete='current-password'
                        aria-label={t('Password')}
                        className={cn(
                          fieldState.isTouched &&
                            !fieldState.invalid &&
                            '[&>input]:border-green-500 [&>input]:focus-visible:border-green-500'
                        )}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            form.handleSubmit(onSubmit)()
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                    {/* Password Strength Indicator */}
                    {passwordStrength.level > 0 && (
                      <div className='mt-1.5 space-y-1.5'>
                        <div className='flex gap-1.5' aria-hidden='true'>
                          {[1, 2, 3].map((segment) => (
                            <div
                              key={segment}
                              className={cn(
                                'h-1.5 flex-1 rounded-full transition-all duration-500 ease-out',
                                segment <= passwordStrength.level
                                  ? passwordStrength.color
                                  : 'bg-muted'
                              )}
                            />
                          ))}
                        </div>
                        <p
                          className={cn(
                            'text-xs font-medium transition-colors duration-300',
                            passwordStrength.level === 1 && 'text-red-500',
                            passwordStrength.level === 2 && 'text-yellow-500',
                            passwordStrength.level === 3 && 'text-green-500'
                          )}
                        >
                          {passwordStrength.labelKey}
                        </p>
                      </div>
                    )}
                    <FormMessage role='alert' />
                    <Link
                      to='/forgot-password'
                      className='text-muted-foreground absolute end-0 -top-0.5 z-10 text-sm font-medium underline underline-offset-4 transition-all duration-200 hover:text-foreground hover:scale-105'
                    >
                      {t('Forgot password?')}
                    </Link>
                  </FormItem>
                )}
              />

              {/* Remember Me Checkbox */}
              <div className='mt-3 flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='remember-me'
                  checked={rememberMe}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setRememberMe(checked)
                    try {
                      if (checked) {
                        localStorage.setItem('remember_me', 'true')
                      } else {
                        localStorage.removeItem('remember_me')
                      }
                    } catch {
                      // localStorage may be unavailable
                    }
                  }}
                  className='border-input bg-background text-primary focus-visible:ring-ring h-4 w-4 shrink-0 cursor-pointer rounded border accent-accent transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50'
                />
                <label
                  htmlFor='remember-me'
                  className='cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  {t('Remember me')}
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type='submit'
                className='mt-2 w-full justify-center gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg'
                disabled={
                  isLoading ||
                  (requiresLegalConsent && !agreedToLegal) ||
                  (!form.formState.isValid && form.formState.isDirty)
                }
                title={
                  !form.formState.isValid && form.formState.isDirty
                    ? t('Please correct the errors before submitting')
                    : undefined
                }
                aria-label={t('Sign in')}
                aria-busy={isLoading}
              >
                {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
                {t('Sign in')}
              </Button>

              {/* Turnstile */}
              {isTurnstileEnabled && (
                <div className='mt-2'>
                  <Turnstile
                    siteKey={turnstileSiteKey}
                    onVerify={setTurnstileToken}
                  />
                </div>
              )}
            </>
          )}

          <LegalConsent
            status={status}
            checked={agreedToLegal}
            onCheckedChange={setAgreedToLegal}
            className='mt-1'
          />

          {!hasAlternativeLogin && alternativeLoginMethods}
        </div>
      </form>

      {hasWeChatLogin && (
        <Dialog
          open={isWeChatDialogOpen}
          onOpenChange={handleWeChatDialogChange}
          title={t('WeChat sign in')}
          description={t(
            'Scan the QR code to follow the official account and reply with \u201c\u9a8c\u8bc1\u7801\u201d to receive your verification code.'
          )}
          contentClassName='max-w-sm'
          headerClassName='text-left'
          contentHeight='auto'
          bodyClassName='space-y-4'
          footer={
            <>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleWeChatDialogChange(false)}
                disabled={isWeChatSubmitting}
                aria-label={t('Cancel')}
              >
                {t('Cancel')}
              </Button>
              <Button
                type='button'
                onClick={handleWeChatLogin}
                disabled={
                  isWeChatSubmitting ||
                  !wechatCode.trim() ||
                  (requiresLegalConsent && !agreedToLegal)
                }
                className='gap-2'
                aria-label={t('Confirm')}
                aria-busy={isWeChatSubmitting}
              >
                {isWeChatSubmitting ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : null}
                {t('Confirm')}
              </Button>
            </>
          }
        >
          <div
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                handleWeChatDialogChange(false)
              }
            }}
          >
            {wechatQrCodeUrl ? (
              <div className='flex justify-center'>
                <img
                  src={wechatQrCodeUrl}
                  alt={t('WeChat login QR code')}
                  className='h-40 w-40 rounded-md border object-contain'
                />
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                {t('QR code is not configured. Please contact support.')}
              </p>
            )}
            <div className='grid gap-2'>
              <Label htmlFor='wechat-code'>{t('Verification code')}</Label>
              <Input
                id='wechat-code'
                placeholder={t('Enter the verification code')}
                value={wechatCode}
                onChange={(event) => setWeChatCode(event.target.value)}
                autoComplete='one-time-code'
                autoFocus
                aria-label={t('Verification code')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleWeChatLogin()
                  }
                }}
              />
            </div>
          </div>
        </Dialog>
      )}
    </Form>
  )
}
