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
import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Power, PowerOff, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { manageUser } from '../api'
import { ERROR_MESSAGES, isUserDeleted } from '../constants'
import { getUserActionMessage } from '../lib'
import { type User } from '../types'
import { useUsers } from './users-provider'

interface DataTableBulkActionsProps {
  table: Table<User>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const { t } = useTranslation()
  const { triggerRefresh } = useUsers()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedUsers = selectedRows.map((row) => row.original)
  const selectedIds = selectedUsers.map((u) => u.id)

  // Filter out deleted users
  const validUsers = selectedUsers.filter((u) => !isUserDeleted(u))

  const handleBatchAction = async (action: 'enable' | 'disable') => {
    if (validUsers.length === 0) return
    try {
      const results = await Promise.all(
        validUsers.map((user) => manageUser(user.id, action))
      )
      const successCount = results.filter((r) => r.success).length
      const failCount = results.length - successCount

      if (failCount === 0) {
        toast.success(t(getUserActionMessage(action)))
      } else {
        toast.warning(
          t('{{success}} succeeded, {{fail}} failed', {
            success: successCount,
            fail: failCount,
          })
        )
      }
      triggerRefresh()
      table.resetRowSelection()
    } catch (_error) {
      toast.error(t(ERROR_MESSAGES.UNEXPECTED))
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    try {
      const results = await Promise.all(
        selectedIds.map((id) => manageUser(id, 'delete'))
      )
      const successCount = results.filter((r) => r.success).length
      const failCount = results.length - successCount

      if (failCount === 0) {
        toast.success(t('Users deleted successfully'))
      } else {
        toast.warning(
          t('{{success}} deleted, {{fail}} failed', {
            success: successCount,
            fail: failCount,
          })
        )
      }
      triggerRefresh()
      table.resetRowSelection()
    } catch (_error) {
      toast.error(t(ERROR_MESSAGES.UNEXPECTED))
    } finally {
      setDeleteOpen(false)
    }
  }

  const canEnable = validUsers.some((u) => u.status !== 1)
  const canDisable = validUsers.some((u) => u.status === 1)

  return (
    <>
      <BulkActionsToolbar table={table} entityName='user'>
        {canEnable && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleBatchAction('enable')}
            className='h-8 text-xs'
          >
            <Power className='mr-1 size-3.5' />
            {t('Enable')}
          </Button>
        )}
        {canDisable && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleBatchAction('disable')}
            className='h-8 text-xs'
          >
            <PowerOff className='mr-1 size-3.5' />
            {t('Disable')}
          </Button>
        )}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setDeleteOpen(true)}
          className='h-8 text-xs text-destructive hover:text-destructive'
        >
          <Trash2 className='mr-1 size-3.5' />
          {t('Delete')}
        </Button>
      </BulkActionsToolbar>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('Batch Delete Users')}
        desc={t(
          'Are you sure you want to delete {{count}} selected user(s)? This action cannot be undone.',
          { count: selectedIds.length }
        )}
        confirmText={t('Delete')}
        destructive
        handleConfirm={handleBatchDelete}
      />
    </>
  )
}
