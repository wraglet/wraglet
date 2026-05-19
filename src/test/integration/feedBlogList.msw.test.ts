import { MOCK_REST_CATALOG } from '@/test/mock-rest/catalog'
import { toMockRestHttpHandlers } from '@/test/mock-rest/mswAdapter'
import { mswServer } from '@/test/msw/nodeServer'
import axios from 'axios'
import { describe, expect, it } from 'vitest'

/**
 * Contract-style check for the same `GET /api/blogs` envelope `FeedClientWrapper`
 * reads via `axios.get` (see `queryKey: ['blogs']`). Uses catalog fixtures + MSW adapter.
 */
describe('FeedClientWrapper blog list API (MSW)', () => {
  it('resolves blogs array from handler', async () => {
    const blogListMocks = MOCK_REST_CATALOG.filter(
      (e) => e.route === '/api/blogs' && e.method === 'GET' && e.status === 200
    )
    mswServer.use(...toMockRestHttpHandlers('http://localhost', blogListMocks))

    const res = await axios.get('http://localhost/api/blogs', {
      params: { limit: 10 }
    })
    expect(Array.isArray(res.data.blogs)).toBe(true)
    expect(res.data.blogs.length).toBeGreaterThan(0)
    expect(res.data.blogs[0]).toMatchObject({ title: 'Sample blog' })
    expect(res.data).toMatchObject({
      nextCursor: null,
      hasMore: false
    })
  })
})
