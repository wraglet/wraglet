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
  default: {
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn().mockResolvedValue({}),
    BLOG_CATEGORIES: []
  }
}))

vi.mock('@/models/BlogComment', () => ({
  default: {}
}))

const mockedUser = vi.mocked(getCurrentUser)
const blogFindOne = vi.mocked(Blog.findOne)
const blogFindByIdAndUpdate = vi.mocked(Blog.findByIdAndUpdate)
const params404 = Promise.resolve({ slug: 'missing-slug' })

describe('GET /api/blogs/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUser.mockResolvedValue(null)
    const chain: Record<string, unknown> = {}
    chain.populate = vi.fn().mockReturnValue(chain)
    chain.lean = vi.fn().mockResolvedValue(null)
    blogFindOne.mockReturnValue(chain as never)
  })

  it('returns 404 when blog does not exist', async () => {
    const req = buildAppRouteRequest('/api/blogs/missing-slug')
    const res = await GET(req, { params: params404 })
    expect(res.status).toBe(404)
  })

  it('returns published blog when slug exists', async () => {
    const publishedParams = Promise.resolve({ slug: 'hello-blog' })
    mockedUser.mockResolvedValue(null)
    const created = new Date('2026-02-01T12:00:00.000Z')
    const blog = {
      _id: 'b1',
      slug: 'hello-blog',
      status: 'published',
      title: 'Hello',
      author: { _id: '507f1f77bcf86cd799439011' },
      createdAt: created,
      reactions: [],
      comments: []
    }
    const nestedLean = vi.fn().mockResolvedValue(blog)
    const c: Record<string, unknown> = {}
    c.populate = vi.fn().mockReturnValue(c)
    c.lean = nestedLean
    blogFindOne.mockReturnValue(c as never)

    const req = buildAppRouteRequest('/api/blogs/hello-blog')
    const res = await GET(req, { params: publishedParams })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.slug).toBe('hello-blog')
    expect(blogFindByIdAndUpdate).toHaveBeenCalled()
  })
})
