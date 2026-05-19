import { MOCK_REST_CATALOG } from '@/test/mock-rest/catalog'
import { toMockRestHttpHandlers } from '@/test/mock-rest/mswAdapter'
import { mswServer } from '@/test/msw/nodeServer'
import { afterEach, describe, expect, it } from 'vitest'

describe('MOCK_REST_CATALOG (MSW integration)', () => {
  afterEach(() => {
    mswServer.resetHandlers()
  })

  it('GET /api/search with q=ada returns catalog success shape', async () => {
    const handlers = toMockRestHttpHandlers(
      'http://localhost',
      MOCK_REST_CATALOG.filter(
        (e) => e.route === '/api/search' && e.method === 'GET'
      )
    )
    mswServer.use(...handlers)

    const res = await fetch('http://localhost/api/search?q=ada')
    expect(res.status).toBe(200)
    const data = (await res.json()) as {
      success: boolean
      query: string
      results: unknown[]
    }
    expect(data.success).toBe(true)
    expect(data.query).toBe('ada')
    expect(Array.isArray(data.results)).toBe(true)
  })

  it('GET /api/blogs with limit=10 returns list fixture', async () => {
    const handlers = toMockRestHttpHandlers(
      'http://localhost',
      MOCK_REST_CATALOG.filter(
        (e) => e.route === '/api/blogs' && e.method === 'GET'
      )
    )
    mswServer.use(...handlers)

    const res = await fetch('http://localhost/api/blogs?limit=10')
    expect(res.status).toBe(200)
    const data = (await res.json()) as { blogs: { title: string }[] }
    expect(data.blogs[0]?.title).toBe('Sample blog')
  })
})
