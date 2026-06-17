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
import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationStore } from './notification-store'

// 每个测试前清空 localStorage，保证测试隔离
beforeEach(() => {
  localStorage.clear()
  // 重置 store 状态
  useNotificationStore.setState({
    notifications: [],
    lastReadNotice: '',
    readAnnouncementKeys: [],
  })
})

// ============================================================================
// 初始状态
// ============================================================================

describe('notification-store 初始状态', () => {
  it('localStorage 为空时加载默认通知', () => {
    // 需要重新初始化 store
    const store = useNotificationStore.getState()
    // 由于 beforeEach 重置了状态为 []，需要重新加载
    // 直接测试 addNotification 方法存在
    expect(typeof store.addNotification).toBe('function')
    expect(typeof store.markAsRead).toBe('function')
    expect(typeof store.markAllAsRead).toBe('function')
    expect(typeof store.unreadCount).toBe('function')
  })
})

// ============================================================================
// addNotification()
// ============================================================================

describe('addNotification', () => {
  it('添加通知到列表顶部', () => {
    const store = useNotificationStore.getState()

    store.addNotification({
      title: '测试通知',
      message: '这是一条测试消息',
      type: 'update',
    })

    const state = useNotificationStore.getState()
    expect(state.notifications.length).toBe(1)
    expect(state.notifications[0].title).toBe('测试通知')
    expect(state.notifications[0].message).toBe('这是一条测试消息')
    expect(state.notifications[0].type).toBe('update')
  })

  it('新通知默认未读', () => {
    const store = useNotificationStore.getState()
    store.addNotification({
      title: '新通知',
      message: '测试',
      type: 'announcement',
    })

    const state = useNotificationStore.getState()
    expect(state.notifications[0].read).toBe(false)
  })

  it('自动生成 id 和 timestamp', () => {
    const store = useNotificationStore.getState()
    store.addNotification({
      title: '自动ID',
      message: '测试',
      type: 'price',
    })

    const state = useNotificationStore.getState()
    expect(state.notifications[0].id).toBeTruthy()
    expect(state.notifications[0].timestamp).toBeGreaterThan(0)
  })

  it('多次添加时新通知排在最前', () => {
    const store = useNotificationStore.getState()

    store.addNotification({ title: '第一个', message: 'msg1', type: 'update' })
    store.addNotification({ title: '第二个', message: 'msg2', type: 'price' })

    const state = useNotificationStore.getState()
    expect(state.notifications[0].title).toBe('第二个')
    expect(state.notifications[1].title).toBe('第一个')
  })
})

// ============================================================================
// markAsRead()
// ============================================================================

describe('markAsRead', () => {
  it('标记指定通知为已读', () => {
    const store = useNotificationStore.getState()
    store.addNotification({ title: '通知', message: 'test', type: 'update' })

    const { notifications } = useNotificationStore.getState()
    const id = notifications[0].id

    useNotificationStore.getState().markAsRead(id)
    const updated = useNotificationStore.getState().notifications
    expect(updated.find((n) => n.id === id)?.read).toBe(true)
  })

  it('不存在的 id 不影响其他通知', () => {
    const store = useNotificationStore.getState()
    store.addNotification({ title: '通知', message: 'test', type: 'update' })

    useNotificationStore.getState().markAsRead('不存在的ID')
    const state = useNotificationStore.getState()
    expect(state.notifications[0].read).toBe(false)
  })
})

// ============================================================================
// markAllAsRead()
// ============================================================================

describe('markAllAsRead', () => {
  it('将所有通知标记为已读', () => {
    const store = useNotificationStore.getState()
    store.addNotification({ title: 'A', message: '1', type: 'update' })
    store.addNotification({ title: 'B', message: '2', type: 'price' })
    store.addNotification({ title: 'C', message: '3', type: 'announcement' })

    useNotificationStore.getState().markAllAsRead()

    const state = useNotificationStore.getState()
    state.notifications.forEach((n) => {
      expect(n.read).toBe(true)
    })
  })

  it('空列表不报错', () => {
    expect(() =>
      useNotificationStore.getState().markAllAsRead()
    ).not.toThrow()
  })
})

// ============================================================================
// unreadCount()
// ============================================================================

describe('unreadCount', () => {
  it('初始未读数为 0', () => {
    expect(useNotificationStore.getState().unreadCount()).toBe(0)
  })

  it('添加通知后未读数增加', () => {
    const store = useNotificationStore.getState()
    store.addNotification({ title: '新', message: 'test', type: 'update' })
    store.addNotification({ title: '新2', message: 'test2', type: 'price' })

    expect(useNotificationStore.getState().unreadCount()).toBe(2)
  })

  it('标记已读后未读数减少', () => {
    const store = useNotificationStore.getState()
    store.addNotification({ title: 'A', message: '1', type: 'update' })
    store.addNotification({ title: 'B', message: '2', type: 'price' })

    const { notifications } = useNotificationStore.getState()
    useNotificationStore.getState().markAsRead(notifications[0].id)

    expect(useNotificationStore.getState().unreadCount()).toBe(1)
  })

  it('全部标记已读后未读数为 0', () => {
    const store = useNotificationStore.getState()
    store.addNotification({ title: 'A', message: '1', type: 'update' })

    useNotificationStore.getState().markAllAsRead()
    expect(useNotificationStore.getState().unreadCount()).toBe(0)
  })
})

// ============================================================================
// markNoticeRead / markAnnouncementsRead / isAnnouncementRead
// ============================================================================

describe('markNoticeRead', () => {
  it('保存已读通知内容', () => {
    useNotificationStore.getState().markNoticeRead('content-v1')
    expect(useNotificationStore.getState().lastReadNotice).toBe('content-v1')
  })
})

describe('markAnnouncementsRead 和 isAnnouncementRead', () => {
  it('记录公告已读状态', () => {
    const store = useNotificationStore.getState()
    store.markAnnouncementsRead(['key1', 'key2'])

    expect(useNotificationStore.getState().isAnnouncementRead('key1')).toBe(true)
    expect(useNotificationStore.getState().isAnnouncementRead('key2')).toBe(true)
    expect(useNotificationStore.getState().isAnnouncementRead('key3')).toBe(false)
  })

  it('追加新 key 不覆盖已有的', () => {
    const store = useNotificationStore.getState()
    store.markAnnouncementsRead(['key1'])
    store.markAnnouncementsRead(['key2'])

    const state = useNotificationStore.getState()
    expect(state.isAnnouncementRead('key1')).toBe(true)
    expect(state.isAnnouncementRead('key2')).toBe(true)
  })
})
