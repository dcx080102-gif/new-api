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
import type { TFunction } from 'i18next'
import { Bell, Megaphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getAnnouncementColorClass } from '@/lib/colors'
import { formatDateTimeObject } from '@/lib/time'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Markdown } from '@/components/ui/markdown'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ============================================================================
// Types
// ============================================================================

interface AnnouncementItem {
  type?: string
  content?: string
  extra?: string
  publishDate?: string | Date
  title?: string
  link?: string
}

interface AnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'notice' | 'announcements'
  notice: string
  announcements: AnnouncementItem[]
  loading: boolean
  unreadCount: number
}

// ============================================================================
// Constants
// ============================================================================

const DISMISS_TODAY_KEY = 'dvl_announcement_dismiss_today'

function getDismissTodayDate(): string | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(DISMISS_TODAY_KEY)
  } catch {
    return null
  }
}

function setDismissTodayDate(): void {
  try {
    if (typeof window === 'undefined') return
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    window.localStorage.setItem(DISMISS_TODAY_KEY, today)
  } catch {
    // localStorage may be unavailable
  }
}

export function isAnnouncementDismissedToday(): boolean {
  const saved = getDismissTodayDate()
  if (!saved) return false
  const today = new Date().toISOString().slice(0, 10)
  return saved === today
}

// ============================================================================
// Helpers
// ============================================================================

function getRelativeTime(publishDate: string | Date, t: TFunction): string {
  if (!publishDate) return ''

  const now = new Date()
  const pubDate = new Date(publishDate)

  if (isNaN(pubDate.getTime())) {
    return typeof publishDate === 'string' ? publishDate : ''
  }

  const diffMs = now.getTime() - pubDate.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffMs < 0) return formatDateTimeObject(pubDate)
  if (diffSeconds < 60) return t('Just now')
  if (diffMinutes < 60)
    return diffMinutes === 1
      ? t('1 minute ago')
      : t('{{count}} minutes ago', { count: diffMinutes })
  if (diffHours < 24)
    return diffHours === 1
      ? t('1 hour ago')
      : t('{{count}} hours ago', { count: diffHours })
  if (diffDays < 7)
    return diffDays === 1
      ? t('1 day ago')
      : t('{{count}} days ago', { count: diffDays })
  if (diffWeeks < 4)
    return diffWeeks === 1
      ? t('1 week ago')
      : t('{{count}} weeks ago', { count: diffWeeks })
  if (diffMonths < 12)
    return diffMonths === 1
      ? t('1 month ago')
      : t('{{count}} months ago', { count: diffMonths })
  if (diffYears < 2) return t('1 year ago')

  return formatDateTimeObject(pubDate)
}

// ============================================================================
// Timeline Dot
// ============================================================================

function TimelineDot({ type }: { type?: string }) {
  return (
    <span
      className={cn(
        'mt-1 inline-block size-2.5 shrink-0 rounded-full ring-2 ring-background',
        getAnnouncementColorClass(type)
      )}
    />
  )
}

// ============================================================================
// Shine Text — shimmer gradient animation
// ============================================================================

function ShineText({ children }: { children: React.ReactNode }) {
  return (
    <span className='relative inline-block shine-text'>
      <span className='relative z-10'>{children}</span>
    </span>
  )
}

// ============================================================================
// Notice Tab Content
// ============================================================================

function NoticeContent({
  notice,
  loading,
  t,
}: {
  notice: string
  loading: boolean
  t: TFunction
}) {
  if (loading) {
    return (
      <EmptyState
        icon={<Bell />}
        title={t('Loading...')}
        description={t('Latest platform updates and notices')}
      />
    )
  }

  if (!notice) {
    return (
      <EmptyState
        icon={<Bell />}
        title={t('No announcements at this time')}
      />
    )
  }

  return (
    <ScrollArea className='h-80 pr-3'>
      <Markdown>{notice}</Markdown>
    </ScrollArea>
  )
}

// ============================================================================
// Announcements Tab Content (Timeline layout)
// ============================================================================

function AnnouncementsContent({
  announcements,
  loading,
  t,
}: {
  announcements: AnnouncementItem[]
  loading: boolean
  t: TFunction
}) {
  if (loading) {
    return (
      <EmptyState
        icon={<Megaphone />}
        title={t('Loading...')}
        description={t('Latest platform updates and notices')}
      />
    )
  }

  if (announcements.length === 0) {
    return (
      <EmptyState
        icon={<Megaphone />}
        title={t('No system announcements')}
      />
    )
  }

  return (
    <ScrollArea className='h-80 pr-3'>
      {/* Timeline container */}
      <div className='relative pl-6'>
        {/* Vertical line */}
        <div className='bg-border absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px' />

        <div className='flex flex-col gap-0'>
          {announcements.map((item, idx) => {
            const publishDate = item.publishDate
              ? new Date(item.publishDate)
              : null
            const relativeTime = publishDate
              ? getRelativeTime(publishDate, t)
              : ''
            const absoluteTime = publishDate
              ? formatDateTimeObject(publishDate)
              : ''

            return (
              <div key={idx} className='relative pb-5 last:pb-0'>
                {/* Timeline dot — positioned on the vertical line */}
                <div className='absolute -left-[23px] top-0'>
                  <TimelineDot type={item.type} />
                </div>

                {/* Content */}
                <div className='flex flex-col gap-1.5'>
                  {/* Title (optional) */}
                  {item.title ? (
                    <p className='text-sm font-semibold text-foreground'>
                      {item.title}
                    </p>
                  ) : null}

                  {/* Content with link support */}
                  <div className='text-sm leading-relaxed text-foreground/90'>
                    <ShineText>
                      {item.link ? (
                        <a
                          href={item.link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary hover:underline'
                        >
                          {item.content || ''}
                        </a>
                      ) : (
                        item.content || ''
                      )}
                    </ShineText>
                  </div>

                  {/* Extra info */}
                  {item.extra ? (
                    <div className='text-muted-foreground text-xs'>
                      <Markdown>{item.extra}</Markdown>
                    </div>
                  ) : null}

                  {/* Timestamp */}
                  {absoluteTime ? (
                    <div className='text-muted-foreground text-xs'>
                      {relativeTime ? `${relativeTime} ` : null}
                      {absoluteTime}
                    </div>
                  ) : null}
                </div>

                {/* Separator between items (not after last) */}
                {idx < announcements.length - 1 ? (
                  <Separator className='mt-4' />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </ScrollArea>
  )
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <Empty className='min-h-48 border-0 p-4'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
    </Empty>
  )
}

// ============================================================================
// Main AnnouncementDialog Component
// ============================================================================

export function AnnouncementDialog(props: AnnouncementDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={
        <div className='flex items-center justify-between w-full'>
          <span>{t('System Announcements')}</span>
        </div>
      }
      contentClassName='sm:max-w-xl'
      contentHeight='auto'
      showCloseButton={false}
      footer={
        <div className='flex items-center gap-2 w-full justify-between'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setDismissTodayDate()
              props.onOpenChange(false)
            }}
          >
            {t('Close Today')}
          </Button>
          <Button
            size='sm'
            onClick={() => props.onOpenChange(false)}
          >
            {t('Close')}
          </Button>
        </div>
      }
    >
      <Tabs
        defaultValue={props.defaultTab || 'announcements'}
      >
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='notice' className='gap-1.5'>
            <Bell className='size-3.5' />
            {t('Notice')}
          </TabsTrigger>
          <TabsTrigger value='announcements' className='gap-1.5'>
            <Megaphone className='size-3.5' />
            {t('System Announcements')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='notice' className='mt-3'>
          <NoticeContent
            notice={props.notice}
            loading={props.loading}
            t={t}
          />
        </TabsContent>

        <TabsContent value='announcements' className='mt-3'>
          <AnnouncementsContent
            announcements={props.announcements}
            loading={props.loading}
            t={t}
          />
        </TabsContent>
      </Tabs>
    </Dialog>
  )
}
