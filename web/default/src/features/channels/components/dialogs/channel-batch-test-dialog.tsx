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
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Channel } from '../../types'

interface ChannelBatchTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channels?: Channel[]
}

export function ChannelBatchTestDialog(props: ChannelBatchTestDialogProps) {
  const { open, onOpenChange, channels } = props
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Batch Test Channels')}</DialogTitle>
          <DialogDescription>
            {t('Testing {{count}} channels...', {
              count: channels?.length || 0,
            })}
          </DialogDescription>
        </DialogHeader>
        {/* TODO: Implement batch test UI */}
        <div className="py-4 text-center text-muted-foreground text-sm">
          {t('Batch test feature coming soon')}
        </div>
      </DialogContent>
    </Dialog>
  )
}
