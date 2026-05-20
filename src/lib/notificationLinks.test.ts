import { getNotificationLink } from '@/lib/notificationLinks'
import type { INotification } from '@/models/Notification'
import { describe, expect, it } from 'vitest'

const baseNotification = {
  _id: 'n1',
  read: false,
  message: 'test',
  createdAt: new Date()
} as unknown as INotification

describe('getNotificationLink', () => {
  it('returns profile link for follow', () => {
    const link = getNotificationLink({
      ...baseNotification,
      type: 'follow',
      sender: { username: 'jane' }
    } as INotification)

    expect(link).toBe('/jane')
  })

  it('returns post link for comment when postId is set', () => {
    const link = getNotificationLink({
      ...baseNotification,
      type: 'comment',
      data: { postId: 'p1' }
    } as INotification)

    expect(link).toBe('/post/p1')
  })

  it('returns feed when comment has no postId', () => {
    const link = getNotificationLink({
      ...baseNotification,
      type: 'comment',
      data: {}
    } as INotification)

    expect(link).toBe('/feed')
  })

  it('returns blog link for reaction on blog only', () => {
    const link = getNotificationLink({
      ...baseNotification,
      type: 'reaction',
      data: { slug: 'my-blog' }
    } as INotification)

    expect(link).toBe('/blog/my-blog')
  })

  it('returns post link for share', () => {
    const link = getNotificationLink({
      ...baseNotification,
      type: 'share',
      data: { postId: 'p2' }
    } as INotification)

    expect(link).toBe('/post/p2')
  })
})
