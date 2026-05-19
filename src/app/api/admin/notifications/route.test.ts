import getCurrentUser from '@/actions/getCurrentUser'
import {
  createAdminNotification,
  createSystemNotification
} from '@/lib/notifications'
import User from '@/models/User'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/lib/notifications', () => ({
  createAdminNotification: vi.fn().mockResolvedValue({ _id: 'n1' }),
  createSystemNotification: vi.fn().mockResolvedValue({ _id: 'n2' })
}))

vi.mock('@/models/User', () => ({
  default: { findOne: vi.fn(), find: vi.fn() }
}))

const mockedUser = vi.mocked(getCurrentUser)
const userFindOne = vi.mocked(User.findOne)
const userFind = vi.mocked(User.find)

describe('POST /api/admin/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without session', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await POST(
      buildAppRouteRequest('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin',
          title: 'T',
          message: 'M'
        })
      })
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 when fields missing', async () => {
    mockedUser.mockResolvedValue({ _id: 'admin' } as never)
    const res = await POST(
      buildAppRouteRequest('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'admin' })
      })
    )
    expect(res.status).toBe(400)
  })

  it('returns 200 when targeting user by email', async () => {
    mockedUser.mockResolvedValue({ _id: 'admin' } as never)
    userFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: 'recv' })
      })
    } as never)

    const res = await POST(
      buildAppRouteRequest('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin',
          title: 'Hello',
          message: 'World',
          recipientEmail: 'u@example.com'
        })
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(createAdminNotification).toHaveBeenCalled()
    expect(createSystemNotification).not.toHaveBeenCalled()
  })

  it('broadcasts system notifications to all users', async () => {
    mockedUser.mockResolvedValue({ _id: 'admin' } as never)
    userFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ _id: 'a' }, { _id: 'b' }])
      })
    } as never)

    const res = await POST(
      buildAppRouteRequest('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'system',
          title: 'Sys',
          message: 'Msg'
        })
      })
    )
    expect(res.status).toBe(200)
    expect(createSystemNotification).toHaveBeenCalledTimes(2)
  })
})
