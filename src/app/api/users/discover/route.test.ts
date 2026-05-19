import getCurrentUser from '@/actions/getCurrentUser'
import Follow from '@/models/Follow'
import Post from '@/models/Post'
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
  default: { find: vi.fn(), aggregate: vi.fn() }
}))

vi.mock('@/models/Post', () => ({
  default: { aggregate: vi.fn() }
}))

vi.mock('@/models/User', () => ({
  default: { find: vi.fn() }
}))

const mockedUser = vi.mocked(getCurrentUser)
const followFind = vi.mocked(Follow.find)
const followAggregate = vi.mocked(Follow.aggregate)
const postAggregate = vi.mocked(Post.aggregate)
const userFind = vi.mocked(User.find)

describe('GET /api/users/discover', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without session', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await GET(buildAppRouteRequest('/api/users/discover'))
    expect(res.status).toBe(401)
  })

  it('returns ranked users when authenticated', async () => {
    mockedUser.mockResolvedValue({
      _id: { toString: () => 'me' }
    } as never)
    followFind.mockResolvedValue([{ followingId: 'other' }] as never)
    followAggregate.mockResolvedValue([] as never)
    postAggregate.mockResolvedValue([] as never)

    const baseUser = {
      _id: 'n1',
      firstName: 'N',
      lastName: 'L',
      username: '@n',
      profilePicture: null,
      gender: 'Female',
      createdAt: new Date('2026-01-01')
    }

    const chain1: {
      sort: ReturnType<typeof vi.fn>
      limit: ReturnType<typeof vi.fn>
      select: ReturnType<typeof vi.fn>
      lean: ReturnType<typeof vi.fn>
    } = {
      sort: vi.fn(),
      limit: vi.fn(),
      select: vi.fn(),
      lean: vi.fn()
    }
    chain1.sort.mockReturnValue(chain1)
    chain1.limit.mockReturnValue(chain1)
    chain1.select.mockReturnValue(chain1)
    chain1.lean.mockResolvedValue([baseUser])

    userFind.mockReturnValueOnce(chain1 as never).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([baseUser])
      })
    } as never)

    const res = await GET(buildAppRouteRequest('/api/users/discover'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.users)).toBe(true)
    expect(body.users.length).toBeGreaterThanOrEqual(1)
  })
})
