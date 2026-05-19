import getCurrentUser from '@/actions/getCurrentUser'
import Post from '@/models/Post'
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

vi.mock('@/models/Post', () => ({
  default: { findById: vi.fn() }
}))

vi.mock('@/utils/convertObjectIdsToStrings', () => ({
  convertObjectIdsToStrings: vi.fn((x: unknown) => x)
}))

const mockedUser = vi.mocked(getCurrentUser)
const postFindById = vi.mocked(Post.findById)
const oid = '507f1f77bcf86cd799439011'
const params = Promise.resolve({ postId: oid })

describe('GET /api/posts/[postId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without session', async () => {
    mockedUser.mockResolvedValue(null)
    const req = buildAppRouteRequest(`/api/posts/${oid}`)
    const res = await GET(req, { params })
    expect(res.status).toBe(401)
  })

  it('returns 404 when post missing', async () => {
    mockedUser.mockResolvedValue({ _id: 'u1' } as never)
    const chain: Record<string, unknown> = {}
    chain.populate = vi.fn().mockReturnValue(chain)
    chain.lean = vi.fn().mockResolvedValue(null)
    postFindById.mockReturnValue(chain as never)
    const req = buildAppRouteRequest(`/api/posts/${oid}`)
    const res = await GET(req, { params })
    expect(res.status).toBe(404)
  })

  it('returns 200 with post payload', async () => {
    mockedUser.mockResolvedValue({ _id: 'u1' } as never)
    const doc = {
      _id: oid,
      content: { text: 'hi' },
      audience: 'public',
      author: { _id: 'u2', username: '@x' }
    }
    const chain: Record<string, unknown> = {}
    chain.populate = vi.fn().mockReturnValue(chain)
    chain.lean = vi.fn().mockResolvedValue(doc)
    postFindById.mockReturnValue(chain as never)
    const req = buildAppRouteRequest(`/api/posts/${oid}`)
    const res = await GET(req, { params })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body._id).toBe(oid)
  })
})
