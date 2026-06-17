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
  Calendar,
  Mail,
  User as UserIcon,
  Shield,
  Users,
  Clock,
  Hash,
  Tag,
  Gift,
  DollarSign,
  Activity,
  AtSign,
} from 'lucide-react'
import { formatQuota, formatTimestamp } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { StatusBadge } from '@/components/status-badge'
import { GroupBadge } from '@/components/group-badge'
import { USER_STATUSES, USER_ROLES, isUserDeleted } from '../constants'
import { type User } from '../types'

interface UsersDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

interface DetailRowProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}

function DetailRow(props: DetailRowProps) {
  const { icon: Icon, label, value } = props
  return (
    <div className='flex items-start gap-3 py-2.5'>
      <Icon className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
      <div className='min-w-0 flex-1'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <div className='mt-0.5 text-sm'>{value}</div>
      </div>
    </div>
  )
}

export function UsersDetailDrawer(props: UsersDetailDrawerProps) {
  const { open, onOpenChange, user } = props
  const { t } = useTranslation()

  if (!user) return null

  const isDeleted = isUserDeleted(user)
  const statusConfig = isDeleted
    ? USER_STATUSES.DELETED
    : USER_STATUSES[user.status as keyof typeof USER_STATUSES]
  const roleConfig = USER_ROLES[user.role as keyof typeof USER_ROLES]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle className='text-lg'>
            {user.display_name || user.username}
          </SheetTitle>
          <SheetDescription>{t('User Details')}</SheetDescription>
        </SheetHeader>
        <Separator className='my-4' />
        <ScrollArea className='h-[calc(100vh-12rem)] pr-1'>
          <div className='space-y-1'>
            <DetailRow
              icon={Hash}
              label={t('ID')}
              value={<span className='font-mono'>{user.id}</span>}
            />

            <DetailRow
              icon={UserIcon}
              label={t('Username')}
              value={<span className='font-medium'>{user.username}</span>}
            />

            {user.display_name && user.display_name !== user.username && (
              <DetailRow
                icon={AtSign}
                label={t('Display Name')}
                value={user.display_name}
              />
            )}

            {user.email && (
              <DetailRow
                icon={Mail}
                label={t('Email')}
                value={user.email}
              />
            )}

            {user.remark && (
              <DetailRow
                icon={Tag}
                label={t('Remark')}
                value={user.remark}
              />
            )}

            <DetailRow
              icon={Activity}
              label={t('Status')}
              value={
                statusConfig ? (
                  <StatusBadge
                    label={t(statusConfig.labelKey)}
                    variant={statusConfig.variant}
                    copyable={false}
                  />
                ) : (
                  <span className='text-muted-foreground'>-</span>
                )
              }
            />

            <DetailRow
              icon={Shield}
              label={t('Role')}
              value={
                roleConfig ? (
                  <span className='inline-flex items-center gap-1.5'>
                    {roleConfig.icon && (
                      <roleConfig.icon size={14} className='text-muted-foreground' />
                    )}
                    {t(roleConfig.labelKey)}
                  </span>
                ) : (
                  <span className='text-muted-foreground'>-</span>
                )
              }
            />

            <DetailRow
              icon={DollarSign}
              label={t('Quota')}
              value={
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary' className='text-xs'>
                      {t('Remaining')}: {formatQuota(user.quota)}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      {t('Used')}: {formatQuota(user.used_quota)}
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {t('Total')}: {formatQuota(user.quota + user.used_quota)} |{' '}
                    {t('Requests')}: {user.request_count.toLocaleString()}
                  </p>
                </div>
              }
            />

            <DetailRow
              icon={Users}
              label={t('Group')}
              value={<GroupBadge group={user.group} />}
            />

            {user.aff_code && (
              <DetailRow
                icon={Gift}
                label={t('Affiliate Code')}
                value={<code className='rounded bg-muted px-1.5 py-0.5 text-xs'>{user.aff_code}</code>}
              />
            )}

            <DetailRow
              icon={Users}
              label={t('Invitation Info')}
              value={
                <div className='space-y-1'>
                  <p className='text-sm'>
                    {t('Invited Users')}: <strong>{user.aff_count || 0}</strong>
                  </p>
                  <p className='text-sm'>
                    {t('Invitation Revenue')}: <strong>{formatQuota(user.aff_history_quota || 0)}</strong>
                  </p>
                  {user.inviter_id ? (
                    <p className='text-sm'>
                      {t('Invited By')}: <strong>ID #{user.inviter_id}</strong>
                    </p>
                  ) : (
                    <p className='text-xs text-muted-foreground'>{t('Not invited by anyone')}</p>
                  )}
                </div>
              }
            />

            <DetailRow
              icon={Calendar}
              label={t('Created At')}
              value={
                <span className='text-sm'>
                  {user.created_at ? formatTimestamp(user.created_at) : '-'}
                </span>
              }
            />

            {user.last_login_at && (
              <DetailRow
                icon={Clock}
                label={t('Last Login')}
                value={
                  <span className='text-sm'>
                    {formatTimestamp(user.last_login_at)}
                  </span>
                }
              />
            )}

            {user.updated_at && (
              <DetailRow
                icon={Clock}
                label={t('Updated At')}
                value={
                  <span className='text-sm'>
                    {formatTimestamp(user.updated_at)}
                  </span>
                }
              />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
