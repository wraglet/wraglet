import getCurrentUser from '@/actions/getCurrentUser'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PATCH } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/lib/notifications', () => ({
  createReactionNotification: vi.fn()
}))

vi.mock('@/models/PostReaction', () => ({
  default: {
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn()
  }
}))

vi.mock('@/models/Share', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn()
  }
}))

const mockedUser = vi.mocked(getCurrentUser)
const sid = '507f1f77bcf86cd799439099'
const params = Promise.resolve({ shareId: sid })

describe('PATCH /api/shares/[shareId]/react', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await PATCH(
      buildAppRouteRequest('/api/shares/x/react', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'like' })
      }),
      { params }
    )
    expect(res.status).toBe(401)
  })
})
