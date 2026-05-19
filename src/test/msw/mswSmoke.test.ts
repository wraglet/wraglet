import { mswServer } from '@/test/msw/nodeServer'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'

describe('MSW (Node) harness', () => {
  afterEach(() => {
    mswServer.resetHandlers()
  })

  it('intercepts when a handler is registered', async () => {
    mswServer.use(
      http.get('http://localhost:5999/msw-contract-smoke', () =>
        HttpResponse.json({ ok: true })
      )
    )
    const res = await fetch('http://localhost:5999/msw-contract-smoke')
    expect(res.ok).toBe(true)
    expect(await res.json()).toEqual({ ok: true })
  })
})
