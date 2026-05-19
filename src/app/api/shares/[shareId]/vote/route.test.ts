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

vi.mock('@/models/PostVote', () => ({
  default: {
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn()
  }
}))

vi.mock('@/models/Share', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn()
  }
}))

const mockedUser = vi.mocked(getCurrentUser)
const params = Promise.resolve({ shareId: '507f1f77bcf86cd799439099' })

describe('/api/shares/[shareId]/vote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('PATCH returns 401 when unauthenticated', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await PATCH(
      buildAppRouteRequest('/api/shares/x/vote', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: 'upvote' })
      }),
      { params }
    )
    expect(res.status).toBe(401)
  })
})
