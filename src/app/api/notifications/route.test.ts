import {
  notificationsListSchema,
  notificationsPatchSuccessSchema
} from '@/contracts/notifications'
import {
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '@/lib/notifications'
import Notification from '@/models/Notification'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET, PATCH } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi
    .fn()
    .mockResolvedValue({ _id: { toString: () => 'uid-1' }, email: 'x@y.z' })
}))

vi.mock('@/models/Notification', () => ({
  default: {
    find: vi.fn(),
    countDocuments: vi.fn()
  }
}))

vi.mock('@/lib/notifications', () => ({
  markAllNotificationsAsRead: vi.fn(),
  markNotificationAsRead: vi.fn()
}))

const notifFind = vi.mocked(Notification.find)
const notifCount = vi.mocked(Notification.countDocuments)

describe('/api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET returns notifications envelope with unreadCount', async () => {
    const createdAt = new Date('2026-01-02T10:00:00Z')
    const lean = vi.fn().mockResolvedValue([
      {
        _id: '507f1f77bcf86cd7994390cc',
        type: 'follow',
        title: 'New follower',
        message: '@s followed you',
        read: false,
        createdAt,
        sender: {
          _id: '507f1f77bcf86cd799439099',
          firstName: 'S',
          lastName: 'R',
          username: '@s',
          gender: 'Female',
          profilePicture: null
        }
      }
    ])
    notifFind.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({ lean })
        })
      })
    } as never)
    notifCount.mockResolvedValue(3)

    const res = await GET(buildAppRouteRequest('/api/notifications?limit=20'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(notificationsListSchema.safeParse(body).success).toBe(true)
    expect(Array.isArray(body.notifications)).toBe(true)
    expect(body.unreadCount).toBe(3)
    expect(body.hasMore).toBe(false)
  })

  it('PATCH returns success when markNotificationAsRead succeeds', async () => {
    vi.mocked(markNotificationAsRead).mockResolvedValue(true)
    notifCount.mockResolvedValue(0)

    const res = await PATCH(
      buildAppRouteRequest('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: 'n1' })
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(notificationsPatchSuccessSchema.safeParse(body).success).toBe(true)
    expect(body.success).toBe(true)
    expect(body.unreadCount).toBe(0)
  })

  it('PATCH returns success when markAllAsRead succeeds', async () => {
    vi.mocked(markAllNotificationsAsRead).mockResolvedValue(true)
    notifCount.mockResolvedValue(0)

    const res = await PATCH(
      buildAppRouteRequest('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })
    )
    expect(res.status).toBe(200)
    const allRead = await res.json()
    expect(notificationsPatchSuccessSchema.safeParse(allRead).success).toBe(
      true
    )
    expect(allRead.success).toBe(true)
  })
})
