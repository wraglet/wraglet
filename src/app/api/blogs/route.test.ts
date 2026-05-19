import getCurrentUser from '@/actions/getCurrentUser'
import Blog from '@/models/Blog'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/models', () => ({
  initModels: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/models/Blog', () => ({
  default: { find: vi.fn() },
  BLOG_CATEGORIES: ['tech']
}))

const mockedUser = vi.mocked(getCurrentUser)
const blogFind = vi.mocked(Blog.find)

describe('GET /api/blogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when author query is not a valid ObjectId', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await GET(
      buildAppRouteRequest('/api/blogs?author=not-a-valid-object-id')
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('author')
  })

  it('returns published blog list for anonymous users', async () => {
    mockedUser.mockResolvedValue(null)
    const created = new Date('2026-02-01T12:00:00.000Z')
    const rows = [
      { _id: 'b1', title: 'Hello', createdAt: created, status: 'published' }
    ]
    const chain: {
      sort: ReturnType<typeof vi.fn>
      limit: ReturnType<typeof vi.fn>
      populate: ReturnType<typeof vi.fn>
      lean: ReturnType<typeof vi.fn>
    } = {
      sort: vi.fn(),
      limit: vi.fn(),
      populate: vi.fn(),
      lean: vi.fn()
    }
    chain.sort.mockReturnValue(chain)
    chain.limit.mockReturnValue(chain)
    chain.populate.mockReturnValue(chain)
    chain.lean.mockResolvedValue(rows)
    blogFind.mockReturnValue(chain as never)

    const res = await GET(buildAppRouteRequest('/api/blogs?limit=5'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.blogs).toHaveLength(1)
    expect(body.hasMore).toBe(false)
  })
})
