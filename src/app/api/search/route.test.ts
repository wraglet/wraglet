import { searchResponseSchema } from '@/contracts/search'
import Post from '@/models/Post'
import User from '@/models/User'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/models/User', () => ({
  default: { find: vi.fn() }
}))

vi.mock('@/models/Post', () => ({
  default: { find: vi.fn() }
}))

const userFind = vi.mocked(User.find)
const postFind = vi.mocked(Post.find)

const chainForLean = <T>(items: T) => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const lean = vi.fn().mockResolvedValue(items)
  chain.select = vi.fn().mockReturnValue(chain)
  chain.limit = vi.fn().mockReturnValue(chain)
  chain.populate = vi.fn().mockReturnValue(chain)
  chain.lean = lean
  return chain
}

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty results without hitting the database when query is missing', async () => {
    const res = await GET(
      buildAppRouteRequest('/api/search') as import('next/server').NextRequest
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    const parsed = searchResponseSchema.safeParse(body)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.results).toEqual([])
      expect(parsed.data.totalCount).toBe(0)
    }
    expect(userFind).not.toHaveBeenCalled()
  })

  it('returns structured SearchResponse for user and post hits', async () => {
    userFind.mockReturnValue(
      chainForLean([
        {
          _id: { toString: () => 'u1' },
          firstName: 'Ada',
          lastName: 'Lovelace',
          username: '@ada',
          profilePicture: { url: 'https://x/ava.png' },
          bio: 'Dev',
          gender: 'Female'
        }
      ]) as never
    )
    postFind.mockReturnValue(
      chainForLean([
        {
          _id: { toString: () => 'p1' },
          content: { text: 'Hello wraglet search' },
          author: {
            firstName: 'Grace',
            lastName: 'Hopper',
            username: '@grace',
            profilePicture: { url: '' },
            gender: 'Female'
          }
        }
      ]) as never
    )

    const res = await GET(
      buildAppRouteRequest(
        '/api/search?q=ada&limit=10'
      ) as import('next/server').NextRequest
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    const parsed = searchResponseSchema.safeParse(body)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.query).toBe('ada')
      expect(parsed.data.results.length).toBeGreaterThan(0)
      expect(parsed.data.results.some((r) => r.type === 'user')).toBe(true)
    }
  })
})
