import getCurrentUser from '@/actions/getCurrentUser'
import Follow from '@/models/Follow'
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

vi.mock('@/models/Follow', () => ({
  default: { find: vi.fn() }
}))

vi.mock('@/models/User', () => ({
  default: { find: vi.fn() }
}))

const mockedUser = vi.mocked(getCurrentUser)
const followFind = vi.mocked(Follow.find)
const userFind = vi.mocked(User.find)

describe('GET /api/users/people-you-may-know', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without session', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await GET(
      buildAppRouteRequest('/api/users/people-you-may-know')
    )
    expect(res.status).toBe(401)
  })

  it('returns second-degree suggestions when authenticated', async () => {
    const selfId = '507f1f77bcf86cd799439099'
    const f1 = '507f1f77bcf86cd799439011'
    const f2 = '507f1f77bcf86cd799439012'
    mockedUser.mockResolvedValue({
      _id: selfId
    } as never)
    followFind
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([{ followingId: f1 }])
        })
      } as never)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([{ followingId: f2 }])
        })
      } as never)
    userFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              _id: f2,
              firstName: 'Sam',
              lastName: 'S',
              username: '@sam',
              profilePicture: null,
              gender: 'Female'
            }
          ])
        })
      })
    } as never)

    const res = await GET(
      buildAppRouteRequest('/api/users/people-you-may-know')
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.users).toHaveLength(1)
  })
})
