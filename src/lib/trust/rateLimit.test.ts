import {
  _resetRateLimitStoreForTests,
  checkRateLimit,
  shouldUseMemoryRateLimit
} from '@/lib/trust/rateLimit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('checkRateLimit (memory)', () => {
  beforeEach(() => {
    _resetRateLimitStoreForTests()
    vi.stubEnv('NODE_ENV', 'test')
  })

  it('allows requests under the limit', async () => {
    const key = 'test:memory:allow'
    expect(await checkRateLimit(key, 3, 60_000)).toEqual({ allowed: true })
    expect(await checkRateLimit(key, 3, 60_000)).toEqual({ allowed: true })
    expect(await checkRateLimit(key, 3, 60_000)).toEqual({ allowed: true })
  })

  it('blocks when the limit is exceeded', async () => {
    const key = 'test:memory:block'
    await checkRateLimit(key, 2, 60_000)
    await checkRateLimit(key, 2, 60_000)
    const blocked = await checkRateLimit(key, 2, 60_000)
    expect(blocked.allowed).toBe(false)
    if (!blocked.allowed) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    }
  })

  it('uses separate counters per key', async () => {
    await checkRateLimit('test:memory:a', 1, 60_000)
    await checkRateLimit('test:memory:a', 1, 60_000)
    expect(await checkRateLimit('test:memory:b', 1, 60_000)).toEqual({
      allowed: true
    })
  })

  it('uses memory mode in tests', () => {
    expect(shouldUseMemoryRateLimit()).toBe(true)
  })
})
