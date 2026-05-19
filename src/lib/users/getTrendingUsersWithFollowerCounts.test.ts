import Follow from '@/models/Follow'
import User from '@/models/User'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getTrendingUsersWithFollowerCounts } from './getTrendingUsersWithFollowerCounts'

vi.mock('@/models/Follow', () => ({
  default: { aggregate: vi.fn() }
}))

vi.mock('@/models/User', () => ({
  default: { find: vi.fn() }
}))

const followAgg = vi.mocked(Follow.aggregate)
const userFind = vi.mocked(User.find)

describe('getTrendingUsersWithFollowerCounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('merges follower counts from aggregation', async () => {
    const oid = { toString: () => '507f1f77bcf86cd799439011' }
    followAgg.mockResolvedValue([{ _id: oid, count: 42 }])
    userFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: oid,
            firstName: 'A',
            lastName: 'B',
            username: '@ab',
            gender: 'Female'
          }
        ])
      })
    } as never)

    const rows = await getTrendingUsersWithFollowerCounts('other-id')
    expect(rows).toHaveLength(1)
    expect(rows[0].followerCount).toBe(42)
    expect(rows[0].firstName).toBe('A')
  })
})
