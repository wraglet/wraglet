import getCurrentUser from '@/actions/getCurrentUser'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DELETE, PATCH } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/models/Post', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn()
  }
}))

vi.mock('@/models/PostVote', () => ({
  default: {
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn()
  }
}))

const mockedUser = vi.mocked(getCurrentUser)
const oid = '507f1f77bcf86cd799439011'
const params = Promise.resolve({ postId: oid })

describe('/api/posts/[postId]/vote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('PATCH returns 401 when unauthenticated', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await PATCH(
      buildAppRouteRequest('/api/posts/x/vote', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: 'upvote' })
      }),
      { params }
    )
    expect(res.status).toBe(401)
  })

  it('DELETE returns 401 when unauthenticated', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await DELETE(
      buildAppRouteRequest('/api/posts/x/vote', { method: 'DELETE' }),
      { params }
    )
    expect(res.status).toBe(401)
  })
})
