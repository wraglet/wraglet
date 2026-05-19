import getCurrentUser from '@/actions/getCurrentUser'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PATCH } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/models', () => ({
  initModels: vi.fn()
}))

vi.mock('@/lib/migrateBlogLikesToReactions', () => ({
  migrateLegacyBlogLikesToReactions: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/notifications', () => ({
  createBlogReactionNotification: vi.fn()
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/models/Blog', () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn()
  }
}))

vi.mock('@/models/PostReaction', () => ({
  default: {
    countDocuments: vi.fn(),
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn()
  }
}))

vi.mock('@/utils/convertObjectIdsToStrings', () => ({
  convertObjectIdsToStrings: vi.fn((x) => x)
}))

const mockedUser = vi.mocked(getCurrentUser)
const params = Promise.resolve({ slug: 'my-blog' })

describe('PATCH /api/blogs/[slug]/react', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await PATCH(
      buildAppRouteRequest('/api/blogs/my-blog/react', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'like' })
      }),
      { params }
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid reaction type when authenticated', async () => {
    mockedUser.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedUser>>)
    const res = await PATCH(
      buildAppRouteRequest('/api/blogs/my-blog/react', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'not-a-reaction' })
      }),
      { params }
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid reaction type')
  })
})
