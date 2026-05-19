import getCurrentUser from '@/actions/getCurrentUser'
import { getTrendingUsersWithFollowerCounts } from '@/lib/users/getTrendingUsersWithFollowerCounts'
import User from '@/models/User'
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

vi.mock('@/models/User', () => ({
  default: { aggregate: vi.fn() }
}))

const mockedUser = vi.mocked(getCurrentUser)
const mockedTrending = vi.mocked(getTrendingUsersWithFollowerCounts)
const userAggregate = vi.mocked(User.aggregate)

describe('GET /api/users/suggested', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedTrending.mockResolvedValue([
      {
        _id: '507f1f77bcf86cd799439011',
        firstName: 'T',
        lastName: 'R',
        username: '@tr',
        profilePicture: null,
        gender: 'Female',
        followerCount: 2
      }
    ] as never)
    userAggregate.mockResolvedValue([
      {
        _id: '507f1f77bcf86cd799439012',
        firstName: 'R',
        lastName: 'U',
        username: '@ru',
        profilePicture: null,
        gender: 'Male'
      }
    ] as never)
  })

  it('returns 401 without session', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await GET(buildAppRouteRequest('/api/users/suggested'))
    expect(res.status).toBe(401)
  })

  it('returns combined suggested users', async () => {
    mockedUser.mockResolvedValue({
      _id: { toString: () => '507f1f77bcf86cd799439099' }
    } as never)
    const res = await GET(buildAppRouteRequest('/api/users/suggested'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.users)).toBe(true)
    expect(body.users.length).toBeGreaterThan(0)
  })
})
