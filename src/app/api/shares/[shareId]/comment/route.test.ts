import getCurrentUser from '@/actions/getCurrentUser'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/lib/ably', () => ({
  getAblyInstance: vi.fn()
}))

vi.mock('@/lib/models', () => ({
  initModels: vi.fn()
}))

vi.mock('@/lib/notifications', () => ({
  createCommentNotification: vi.fn()
}))

vi.mock('@/models/Comment', () => ({
  default: { create: vi.fn() }
}))

vi.mock('@/models/Share', () => ({
  default: { findById: vi.fn() }
}))

const mockedUser = vi.mocked(getCurrentUser)
const oid = '507f1f77bcf86cd799439011'
const params = Promise.resolve({ shareId: oid })

describe('POST /api/shares/[shareId]/comment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await POST(
      buildAppRouteRequest('/api/shares/x/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'hi' })
      }),
      { params }
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 when content is missing', async () => {
    mockedUser.mockResolvedValue({
      _id: oid,
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedUser>>)
    const res = await POST(
      buildAppRouteRequest('/api/shares/x/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }),
      { params }
    )
    expect(res.status).toBe(400)
  })
})
