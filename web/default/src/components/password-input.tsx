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
import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Input } from './ui/input'

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  ref?: React.Ref<HTMLInputElement>
}

export function PasswordInput({
  className,
  disabled,
  ref,
  ...props
}: PasswordInputProps) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className={cn('relative rounded-md', className)}>
      <Input
        type={showPassword ? 'text' : 'password'}
        ref={ref}
        disabled={disabled}
        className='pr-10'
        {...props}
      />
      <button
        type='button'
        disabled={disabled}
        className='absolute end-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50'
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={t('Toggle password visibility')}
        tabIndex={-1}
      >
        <EyeOff
          size={17}
          aria-hidden='true'
          className={cn(
            'col-start-1 row-start-1 transition-all duration-200',
            showPassword ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          )}
        />
        <Eye
          size={17}
          aria-hidden='true'
          className={cn(
            'col-start-1 row-start-1 transition-all duration-200',
            showPassword ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          )}
        />
      </button>
    </div>
  )
}
