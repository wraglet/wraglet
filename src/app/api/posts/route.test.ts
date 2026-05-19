import getCurrentUser from '@/actions/getCurrentUser'
import {
  postsFeedSuccessSchema,
  postsFeedUnauthorizedSchema
} from '@/contracts/postsFeed'
import Follow from '@/models/Follow'
import Post from '@/models/Post'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET, POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/models/Follow', () => ({
  default: { find: vi.fn() }
}))

vi.mock('@/lib/ably', () => ({
  getAblyInstance: vi.fn(() => ({
    channels: {
      get: vi.fn(() => ({
        publish: vi.fn().mockResolvedValue(undefined)
      }))
    }
  }))
}))

vi.mock('@/lib/notifications', () => ({
  createNewPostNotification: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/models/Post', () => ({
  default: { find: vi.fn(), create: vi.fn(), findById: vi.fn() }
}))

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(function S3Mock(this: {
    send: ReturnType<typeof vi.fn>
  }) {
    this.send = vi.fn().mockResolvedValue({})
  }),
  PutObjectCommand: vi.fn()
}))

const mockedGetCurrentUser = vi.mocked(getCurrentUser)

const followFind = vi.mocked(Follow.find)
const postFind = vi.mocked(Post.find)
const postCreate = vi.mocked(Post.create)
const postFindById = vi.mocked(Post.findById)

const postTrendingChain = (items: unknown[]) => {
  const end = { lean: vi.fn().mockResolvedValue(items) }
  const c3 = { populate: vi.fn().mockReturnValue(end) }
  const c2 = { populate: vi.fn().mockReturnValue(c3) }
  const c1 = { populate: vi.fn().mockReturnValue(c2) }
  return c1
}

describe('/api/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_R2_USERS_URL = 'https://r2.test'
    process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME = 'bucket'
  })

  it('returns 401 payload when there is no session user', async () => {
    mockedGetCurrentUser.mockResolvedValue(null)
    const res = await GET(buildAppRouteRequest('/api/posts?feedType=trending'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(postsFeedUnauthorizedSchema.safeParse(body).success).toBe(true)
    expect(body.posts).toEqual([])
    expect(body.nextCursor).toBe(null)
  })

  it('returns posts and nextCursor for trending feed when user is authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      _id: { toString: () => 'u1' },
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedGetCurrentUser>>)

    followFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([])
      })
    } as never)

    const created = new Date('2026-03-01T00:00:00Z')
    const trendingRow = {
      _id: '507f1f77bcf86cd799439011',
      content: { text: 'Trending post' },
      createdAt: created,
      reactions: [],
      comments: [],
      shareCount: 0,
      audience: 'public',
      author: {
        _id: '507f1f77bcf86cd799439099',
        firstName: 'A',
        lastName: 'B',
        username: '@ab',
        profilePicture: null,
        gender: 'Female',
        pronoun: 'They/Them'
      }
    }
    // limit+1 rows avoids fallback `Post.find` branch that needs extra chain mocks
    const rows = Array.from({ length: 6 }, (_, i) => ({
      ...trendingRow,
      _id: `507f1f77bcf86cd7994390${10 + i}`
    }))
    postFind.mockReturnValue(postTrendingChain(rows) as never)

    const res = await GET(
      buildAppRouteRequest('/api/posts?feedType=trending&limit=5')
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(postsFeedSuccessSchema.safeParse(body).success).toBe(true)
    expect(Array.isArray(body.posts)).toBe(true)
    expect(body.posts.length).toBe(5)
  })

  it('POST returns 401 when unauthenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(null)
    const res = await POST(
      buildAppRouteRequest('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'hello' })
      })
    )
    expect(res.status).toBe(401)
  })

  it('POST creates text post and returns JSON when authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      _id: { toString: () => 'u1' },
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedGetCurrentUser>>)

    followFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([])
      })
    } as never)

    postCreate.mockResolvedValue({
      _id: { toString: () => 'newpost' }
    } as never)

    const populated = {
      _id: 'newpost',
      content: { text: 'hello' },
      audience: 'public',
      author: {
        _id: 'u1',
        firstName: 'A',
        lastName: 'B',
        username: '@ab',
        gender: 'Female',
        pronoun: 'They/Them' as const
      },
      reactions: [],
      comments: []
    }
    const chain: Record<string, unknown> = {}
    chain.populate = vi.fn(() => chain)
    chain.lean = vi.fn().mockResolvedValue(populated)
    postFindById.mockReturnValue(chain as never)

    const res = await POST(
      buildAppRouteRequest('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'hello' })
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.content?.text).toBe('hello')
    expect(postCreate).toHaveBeenCalled()
  })

  const png1x1 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

  it('POST creates blog-share post with preview metadata', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      _id: { toString: () => 'u1' },
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedGetCurrentUser>>)

    followFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([])
      })
    } as never)

    postCreate.mockResolvedValue({
      _id: { toString: () => 'blogpost' }
    } as never)

    const populated = {
      _id: 'blogpost',
      content: {
        blogPreview: {
          url: 'https://example.com/b',
          slug: 'sl',
          title: 'Hello Blog',
          summary: '',
          category: '',
          coverImage: null
        }
      },
      audience: 'public',
      author: {
        _id: 'u1',
        firstName: 'A',
        lastName: 'B',
        username: '@ab',
        gender: 'Female',
        pronoun: 'They/Them' as const
      },
      reactions: [],
      comments: []
    }
    const chain: Record<string, unknown> = {}
    chain.populate = vi.fn(() => chain)
    chain.lean = vi.fn().mockResolvedValue(populated)
    postFindById.mockReturnValue(chain as never)

    const res = await POST(
      buildAppRouteRequest('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '',
          isBlogShare: true,
          blogUrl: 'https://example.com/b',
          blogSlug: 'sl',
          blogTitle: 'Hello Blog'
        })
      })
    )
    expect(res.status).toBe(200)
    expect(postCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          blogPreview: expect.objectContaining({
            slug: 'sl',
            title: 'Hello Blog'
          })
        })
      })
    )
  })

  it('POST creates image post when authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      _id: { toString: () => 'u1' },
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedGetCurrentUser>>)

    followFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([])
      })
    } as never)

    postCreate.mockResolvedValue({
      _id: { toString: () => 'imgpost' }
    } as never)

    const populated = {
      _id: 'imgpost',
      content: {
        images: [{ url: 'http://r2/u.png', key: 'posts/k.png' }]
      },
      audience: 'public',
      author: {
        _id: 'u1',
        firstName: 'A',
        lastName: 'B',
        username: '@ab',
        gender: 'Female',
        pronoun: 'They/Them' as const
      },
      reactions: [],
      comments: []
    }
    const chain: Record<string, unknown> = {}
    chain.populate = vi.fn(() => chain)
    chain.lean = vi.fn().mockResolvedValue(populated)
    postFindById.mockReturnValue(chain as never)

    const res = await POST(
      buildAppRouteRequest('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: png1x1 })
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.content?.images?.length).toBe(1)
  })
})
