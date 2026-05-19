import { activitiesSuccessSchema } from '@/contracts/activities'
import Follow from '@/models/Follow'
import Post from '@/models/Post'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn().mockResolvedValue({
    _id: { toString: () => 'me' },
    email: 'me@test.local'
  })
}))

vi.mock('@/models/Follow', () => ({
  default: { find: vi.fn() }
}))

vi.mock('@/models/Post', () => ({
  default: { find: vi.fn() }
}))

const followFind = vi.mocked(Follow.find)
const postFind = vi.mocked(Post.find)

describe('GET /api/activities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('serializes post content objects without calling substring on them', async () => {
    const leanFollowings = vi.fn().mockResolvedValue([{ followingId: 'other' }])
    followFind.mockImplementation((...args: unknown[]) => {
      const q = args[0] as Record<string, unknown> | undefined
      if (q && 'followerId' in q && 'createdAt' in q) {
        return {
          populate: vi.fn().mockReturnValue({
            populate: vi.fn().mockReturnValue({
              sort: vi.fn().mockReturnValue({
                limit: vi
                  .fn()
                  .mockReturnValue({ lean: vi.fn().mockResolvedValue([]) })
              })
            })
          })
        } as never
      }
      return {
        select: vi.fn().mockReturnValue({ lean: leanFollowings })
      } as never
    })

    const author = {
      _id: '507f1f77bcf86cd799439099',
      firstName: 'Pat',
      lastName: 'C',
      username: '@pat',
      profilePicture: null,
      gender: 'Female'
    }
    const postLean = vi.fn().mockResolvedValue([
      {
        _id: '507f1f77bcf86cd799439011',
        author,
        content: { text: 'Structured content works' },
        createdAt: new Date('2026-01-01T12:00:00Z')
      }
    ])
    postFind.mockReturnValue({
      populate: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({ lean: postLean })
        })
      })
    } as never)

    const res = await GET(buildAppRouteRequest('/api/activities?limit=5'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(activitiesSuccessSchema.safeParse(body).success).toBe(true)
    const postActivity = body.activities.find(
      (a: { type: string }) => a.type === 'post'
    )
    expect(postActivity?.data?.content).toBe('Structured content works')
  })
})
