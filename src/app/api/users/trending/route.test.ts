import getCurrentUser from '@/actions/getCurrentUser'
import { usersTrendingSuccessSchema } from '@/contracts/usersApi'
import { getTrendingUsersWithFollowerCounts } from '@/lib/users/getTrendingUsersWithFollowerCounts'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/lib/users/getTrendingUsersWithFollowerCounts', () => ({
  getTrendingUsersWithFollowerCounts: vi.fn()
}))

const mockedUser = vi.mocked(getCurrentUser)
const mockedTrending = vi.mocked(getTrendingUsersWithFollowerCounts)

describe('GET /api/users/trending', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without session', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await GET(buildAppRouteRequest('/api/users/trending'))
    expect(res.status).toBe(401)
  })

  it('returns trending users', async () => {
    mockedUser.mockResolvedValue({
      _id: { toString: () => 'u1' }
    } as never)
    mockedTrending.mockResolvedValue([
      {
        _id: '507f1f77bcf86cd799439020',
        firstName: 'A',
        lastName: 'B',
        username: '@ab',
        profilePicture: null,
        gender: 'Female',
        followerCount: 3
      }
    ] as never)

    const res = await GET(buildAppRouteRequest('/api/users/trending'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(usersTrendingSuccessSchema.safeParse(body).success).toBe(true)
    expect(body.users).toHaveLength(1)
  })
})
