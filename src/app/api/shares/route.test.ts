import getCurrentUser from '@/actions/getCurrentUser'
import Follow from '@/models/Follow'
import Post from '@/models/Post'
import Share from '@/models/Share'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET, POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
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
  createShareNotification: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/models/Follow', () => ({
  default: { find: vi.fn() }
}))

vi.mock('@/models/Post', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn().mockResolvedValue({})
  }
}))

vi.mock('@/models/Share', () => ({
  default: {
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn()
  }
}))

const mockedUser = vi.mocked(getCurrentUser)
const shareFindById = vi.mocked(Share.findById)
const shareFindOne = vi.mocked(Share.findOne)
const shareFind = vi.mocked(Share.find)
const postFindById = vi.mocked(Post.findById)
const followFind = vi.mocked(Follow.find)
const oid = '507f1f77bcf86cd799439011'

const selectAuthorLean = (doc: unknown) =>
  ({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(doc)
    })
  }) as never

describe('/api/shares', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    shareFindById.mockResolvedValue(null as never)
    shareFindOne.mockResolvedValue(null as never)
    postFindById.mockReturnValue(selectAuthorLean(null))
    followFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([])
      })
    } as never)
  })

  it('POST returns 401 when unauthenticated', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await POST(
      buildAppRouteRequest('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalPostId: oid })
      })
    )
    expect(res.status).toBe(401)
  })

  it('POST returns 400 for invalid post id', async () => {
    mockedUser.mockResolvedValue({
      _id: { toString: () => 'u1' },
      email: 'a@b.c'
    } as never)
    const res = await POST(
      buildAppRouteRequest('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalPostId: 'not-an-object-id' })
      })
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('Invalid')
  })

  it('POST returns 404 when post does not exist', async () => {
    mockedUser.mockResolvedValue({
      _id: { toString: () => 'u1' },
      email: 'a@b.c'
    } as never)
    shareFindById.mockResolvedValue(null as never)
    postFindById.mockReturnValue(selectAuthorLean(null))
    const res = await POST(
      buildAppRouteRequest('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalPostId: oid })
      })
    )
    expect(res.status).toBe(404)
  })

  it('GET returns shares for authenticated user', async () => {
    mockedUser.mockResolvedValue({ _id: { toString: () => 'u1' } } as never)
    followFind
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([])
        })
      } as never)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([])
        })
      } as never)

    const created = new Date('2026-03-01T00:00:00.000Z')
    const docs = [{ createdAt: created }]
    const q = {
      sort: vi.fn(),
      limit: vi.fn(),
      populate: vi.fn()
    }
    q.sort.mockReturnValue(q)
    q.limit.mockReturnValue(q)
    let populateCalls = 0
    q.populate.mockImplementation(() => {
      populateCalls += 1
      return populateCalls < 4 ? q : Promise.resolve(docs)
    })
    shareFind.mockReturnValue(q as never)

    const res = await GET(buildAppRouteRequest('/api/shares?limit=10'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.shares)).toBe(true)
    expect(body.shares.length).toBe(1)
    expect(body.hasMore).toBe(false)
  })
})
