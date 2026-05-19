import getCurrentUser from '@/actions/getCurrentUser'
import { getAblyInstance } from '@/lib/ably'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/models', () => ({
  initModels: vi.fn()
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/lib/ably', () => ({
  getAblyInstance: vi.fn()
}))

vi.mock('@/lib/apiError', () => ({
  safeApiError: vi.fn((e) => e)
}))

vi.mock('@/models/Blog', () => ({
  default: {
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn()
  }
}))

vi.mock('@/models/BlogComment', () => ({
  default: { create: vi.fn() }
}))

vi.mock('@/utils/convertObjectIdsToStrings', () => ({
  convertObjectIdsToStrings: vi.fn((x) => x)
}))

const mockedUser = vi.mocked(getCurrentUser)
const params = Promise.resolve({ slug: 'published-slug' })

describe('POST /api/blogs/[slug]/comment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await POST(
      buildAppRouteRequest('/api/blogs/published-slug/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Nice read' })
      }),
      { params }
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 when content is empty', async () => {
    mockedUser.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedUser>>)
    const res = await POST(
      buildAppRouteRequest('/api/blogs/published-slug/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '   ' })
      }),
      { params }
    )
    expect(res.status).toBe(400)
    expect(vi.mocked(getAblyInstance)).not.toHaveBeenCalled()
  })
})
