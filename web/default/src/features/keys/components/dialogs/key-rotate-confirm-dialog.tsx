/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function KeyRotateConfirmDialog(props: Props) {
  const { t } = useTranslation()

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t('View full API key')}
      contentClassName='sm:max-w-md'
      contentHeight='auto'
      bodyClassName='space-y-4'
      footer={
        <>
          <Button variant='outline' onClick={() => props.onOpenChange(false)}>
            {t('Cancel')}
          </Button>
          <Button variant='destructive' onClick={props.onConfirm}>
            {t('Continue')}
          </Button>
        </>
      }
    >
      <div className='space-y-3 text-sm'>
        <p className='font-medium text-destructive'>
          {t(
            'Viewing or copying the key will regenerate it. The old key will stop working immediately.'
          )}
        </p>
        <p className='text-muted-foreground'>
          {t(
            'If this key is already used in Codex, Claude Code or other tools, you must update them with the new key.'
          )}
        </p>
      </div>
    </Dialog>
  )
}
