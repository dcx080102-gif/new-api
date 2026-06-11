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
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  unreadCount: () => number
}

function loadFromStorage(): Notification[] {
  try {
    const stored = localStorage.getItem('dvl_notifications')
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
      title: '模型价格更新',
      message: 'GPT-4o 价格已调整为 ¥0.015/1K tokens，Claude 3.5 Sonnet 降至 ¥0.012/1K tokens',
      type: 'price',
      timestamp: now - 3600000,
      read: false,
    },
    {
      id: '2',
      title: '系统更新公告',
      message: '平台已完成 v2.0 升级，新增批量操作功能和优化了响应速度',
      type: 'update',
      timestamp: now - 86400000,
      read: false,
    },
    {
      id: '3',
      title: '新模型上线',
      message: 'DeepSeek-V3 和 Gemini 2.0 Flash 已接入，欢迎试用',
      type: 'announcement',
      timestamp: now - 172800000,
      read: true,
    },
  ]
}

function saveToStorage(notifications: Notification[]) {
  try {
    localStorage.setItem('dvl_notifications', JSON.stringify(notifications))
  } catch {
    // localStorage may be unavailable
  }
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: loadFromStorage(),

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
}))
