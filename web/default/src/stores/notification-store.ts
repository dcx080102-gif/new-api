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
import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'price' | 'update' | 'announcement'
  timestamp: number
  read: boolean
}

interface NotificationStore {
  notifications: Notification[]
  lastReadNotice: string
  readAnnouncementKeys: string[]
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  markNoticeRead: (content: string) => void
  markAnnouncementsRead: (keys: string[]) => void
  isAnnouncementRead: (key: string) => boolean
  unreadCount: () => number
}

function loadFromStorage(): Notification[] {
  try {
    const stored = localStorage.getItem('dvl_notifications_v3')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
    const defaults = getDefaultNotifications()
    saveToStorage(defaults)
    return defaults
  } catch {
    const defaults = getDefaultNotifications()
    return defaults
  }
}

function getDefaultNotifications(): Notification[] {
  const now = Date.now()
  return [
    {
      id: '1',
      title: '🎉 GLM-4.7-Flash 永久免费',
      message: '智谱官方免费模型已接入，创建 API Key 即可调用，零成本体验大模型。查看模型广场了解更多。',
      type: 'announcement',
      timestamp: now - 3600000,
      read: false,
    },
    {
      id: '2',
      title: '🚀 快速上手',
      message: 'Base URL: https://otterl.com/v1，兼容 OpenAI SDK，改一行代码即可接入。支持 GPT、Claude、DeepSeek、GLM、Qwen 等模型。',
      type: 'announcement',
      timestamp: now - 7200000,
      read: false,
    },
    {
      id: '3',
      title: '💰 透明定价',
      message: '国产模型（DeepSeek/GLM/Qwen）官方价 +5% 透明毛利，GPT/Claude 走低成本渠道。每款模型价格实时公开可查。',
      type: 'announcement',
      timestamp: now - 10800000,
      read: false,
    },
    {
      id: '4',
      title: '📢 新站上线',
      message: 'otter Link 正式运营！如有问题或建议，欢迎联系客服反馈。',
      type: 'announcement',
      timestamp: now - 14400000,
      read: false,
    },
  ]
}

function saveToStorage(notifications: Notification[]) {
  try {
    localStorage.setItem('dvl_notifications_v3', JSON.stringify(notifications))
  } catch {
    // localStorage may be unavailable
  }
}

const LAST_READ_NOTICE_KEY = 'dvl_last_read_notice'
const READ_ANNOUNCEMENT_KEYS_KEY = 'dvl_read_announcement_keys'

function loadLastReadNotice(): string {
  try {
    return localStorage.getItem(LAST_READ_NOTICE_KEY) || ''
  } catch {
    return ''
  }
}

function loadReadAnnouncementKeys(): string[] {
  try {
    const raw = localStorage.getItem(READ_ANNOUNCEMENT_KEYS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLastReadNotice(content: string) {
  try {
    localStorage.setItem(LAST_READ_NOTICE_KEY, content)
  } catch {
    // localStorage may be unavailable
  }
}

function saveReadAnnouncementKeys(keys: string[]) {
  try {
    localStorage.setItem(READ_ANNOUNCEMENT_KEYS_KEY, JSON.stringify(keys))
  } catch {
    // localStorage may be unavailable
  }
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: loadFromStorage(),
  lastReadNotice: loadLastReadNotice(),
  readAnnouncementKeys: loadReadAnnouncementKeys(),

  addNotification: (n) => {
    const notification: Notification = {
      ...n,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    }
    set((state) => {
      const updated = [notification, ...state.notifications].slice(0, 50)
      saveToStorage(updated)
      return { notifications: updated }
    })
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      saveToStorage(updated)
      return { notifications: updated }
    })
  },

  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }))
      saveToStorage(updated)
      return { notifications: updated }
    })
  },

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  markNoticeRead: (content: string) => {
    saveLastReadNotice(content)
    set({ lastReadNotice: content })
  },

  markAnnouncementsRead: (keys: string[]) => {
    const current = get().readAnnouncementKeys
    const merged = [...new Set([...current, ...keys])]
    saveReadAnnouncementKeys(merged)
    set({ readAnnouncementKeys: merged })
  },

  isAnnouncementRead: (key: string) => {
    return get().readAnnouncementKeys.includes(key)
  },
}))
