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
import { useTranslation } from 'react-i18next'
import {
  Mail,
  CheckCheck,
  Banknote,
  Bell,
  Megaphone,
  Circle,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useNotificationStore,
  type Notification,
} from '@/stores/notification-store'

function typeIcon(type: Notification['type']) {
  const className = 'h-5 w-5 shrink-0'
  switch (type) {
    case 'price':
      return <Banknote className={cn(className, 'text-amber-500')} />
    case 'update':
      return <Bell className={cn(className, 'text-blue-500')} />
    case 'announcement':
      return <Megaphone className={cn(className, 'text-emerald-500')} />
  }
}

function typeLabel(type: Notification['type'], t: (key: string) => string) {
  switch (type) {
    case 'price':
      return t('Price Update')
    case 'update':
      return t('System Update')
    case 'announcement':
      return t('Announcement')
  }
}

function typeColor(type: Notification['type']) {
  switch (type) {
    case 'price':
      return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200'
    case 'update':
      return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200'
    case 'announcement':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
  }
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageDropdown() {
  const { t } = useTranslation()
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
  const unreadCount = notifications.filter((n) => !n.read).length
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedNotification = selectedId
    ? notifications.find((n) => n.id === selectedId) ?? null
    : null

  const handleSelect = (id: string) => {
    markAsRead(id)
    setSelectedId(id)
  }

  const handleBack = () => {
    setSelectedId(null)
  }

  const handleDropdownChange = (open: boolean) => {
    if (!open) {
      // Reset selection when dropdown closes
      setTimeout(() => setSelectedId(null), 150)
    }
  }

  return (
    <DropdownMenu modal={false} onOpenChange={handleDropdownChange}>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className='relative h-9 w-9 transition-all duration-200 hover:scale-110 hover:text-primary'
          />
        }
      >
        <Mail className='size-[1.2rem]' />
        {unreadCount > 0 && (
          <span className='absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <span className='sr-only'>{t('Messages')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80 p-0'>
        {selectedNotification ? (
          /* Detail view */
          <div>
            <div className='flex items-center gap-2 border-b px-4 py-3'>
              <button
                onClick={handleBack}
                className='inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted'
              >
                <ArrowLeft className='h-4 w-4' />
              </button>
              <span className='text-sm font-semibold'>
                {t('Message Detail')}
              </span>
            </div>
            <div className='max-h-[360px] overflow-y-auto p-4'>
              {/* Type badge */}
              <div
                className={cn(
                  'mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  typeColor(selectedNotification.type)
                )}
              >
                {typeIcon(selectedNotification.type)}
                {typeLabel(selectedNotification.type, t)}
              </div>

              <h3 className='mb-2 text-base font-semibold'>
                {selectedNotification.title}
              </h3>

              <div className='mb-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap'>
                {selectedNotification.message}
              </div>

              {/* Example detailed content based on type */}
              {selectedNotification.type === 'price' && (
                <div className='space-y-2 rounded-lg border bg-muted/30 p-3 text-xs'>
                  <p className='font-medium text-foreground'>价格变更明细：</p>
                  <table className='w-full text-left'>
                    <thead>
                      <tr className='border-b text-muted-foreground'>
                        <th className='py-1 font-medium'>模型</th>
                        <th className='py-1 font-medium'>原价</th>
                        <th className='py-1 font-medium'>现价</th>
                        <th className='py-1 font-medium text-emerald-500'>降幅</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className='border-b border-muted'>
                        <td className='py-1'>GPT-4o</td>
                        <td className='py-1 text-muted-foreground'>¥0.020</td>
                        <td className='py-1'>¥0.015</td>
                        <td className='py-1 text-emerald-500'>-25%</td>
                      </tr>
                      <tr className='border-b border-muted'>
                        <td className='py-1'>Claude 3.5 Sonnet</td>
                        <td className='py-1 text-muted-foreground'>¥0.018</td>
                        <td className='py-1'>¥0.012</td>
                        <td className='py-1 text-emerald-500'>-33%</td>
                      </tr>
                      <tr>
                        <td className='py-1'>Gemini 2.0 Flash</td>
                        <td className='py-1 text-muted-foreground'>¥0.008</td>
                        <td className='py-1'>¥0.005</td>
                        <td className='py-1 text-emerald-500'>-37%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {selectedNotification.type === 'update' && (
                <div className='space-y-2 rounded-lg border bg-muted/30 p-3 text-xs'>
                  <p className='font-medium text-foreground'>更新内容：</p>
                  <ul className='list-inside list-disc space-y-1 text-muted-foreground'>
                    <li>新增批量操作功能：支持批量创建/删除 API Key</li>
                    <li>优化 API 响应速度，平均延迟降低 40%</li>
                    <li>修复了若干已知问题，提升系统稳定性</li>
                    <li>升级底层依赖至最新版本</li>
                  </ul>
                </div>
              )}

              {selectedNotification.type === 'announcement' && (
                <div className='space-y-2 rounded-lg border bg-muted/30 p-3 text-xs'>
                  <p className='font-medium text-foreground'>新增模型：</p>
                  <ul className='list-inside list-disc space-y-1 text-muted-foreground'>
                    <li>DeepSeek-V3 — 支持 128K 上下文，¥0.003/1K tokens</li>
                    <li>Gemini 2.0 Flash — 超低延迟，¥0.005/1K tokens</li>
                  </ul>
                  <div className='mt-2 flex items-center gap-1 text-primary'>
                    <ExternalLink className='h-3 w-3' />
                    <span>前往模型广场查看详情 →</span>
                  </div>
                </div>
              )}

              <p className='mt-4 text-[10px] text-muted-foreground/60'>
                {formatDate(selectedNotification.timestamp)}
              </p>
            </div>
          </div>
        ) : (
          /* List view */
          <>
            <div className='flex items-center justify-between border-b px-4 py-3'>
              <span className='text-sm font-semibold'>
                {t('Messages')}
                {unreadCount > 0 && (
                  <span className='ml-1.5 text-xs font-normal text-muted-foreground'>
                    ({unreadCount})
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className='inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary'
                >
                  <CheckCheck className='h-3.5 w-3.5' />
                  {t('Mark all as read')}
                </button>
              )}
            </div>

            <div className='max-h-[320px] overflow-y-auto'>
              {notifications.length === 0 ? (
                <div className='flex flex-col items-center gap-2 py-10 text-muted-foreground'>
                  <Mail className='h-8 w-8 opacity-30' />
                  <p className='text-sm'>{t('No messages')}</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleSelect(n.id)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50',
                      !n.read && 'bg-primary/5'
                    )}
                  >
                    <div className='mt-0.5'>{typeIcon(n.type)}</div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={cn(
                            'text-sm',
                            !n.read ? 'font-semibold' : 'font-medium'
                          )}
                        >
                          {n.title}
                        </span>
                        {!n.read && (
                          <Circle className='h-1.5 w-1.5 shrink-0 fill-blue-500 text-blue-500' />
                        )}
                      </div>
                      <p className='mt-0.5 line-clamp-2 text-xs text-muted-foreground'>
                        {n.message}
                      </p>
                      <span className='mt-1 block text-[10px] text-muted-foreground/60'>
                        {formatTime(n.timestamp)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
