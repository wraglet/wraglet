import Post from '@/models/Post'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/models/Post', () => ({
  default: { aggregate: vi.fn() }
}))

const postAggregate = vi.mocked(Post.aggregate)

describe('GET /api/users/topics-trending', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    postAggregate.mockResolvedValue([{ _id: 'react', count: 5 }])
  })

  it('returns trending topics', async () => {
    const res = await GET(buildAppRouteRequest('/api/users/topics-trending'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.topics).toEqual([{ tag: 'react', count: 5 }])
  })
})
