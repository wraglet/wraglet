import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  isTurnstileConfigured,
  shouldSkipTurnstile,
  verifyTurnstileToken
} from './verifyTurnstile'

describe('verifyTurnstileToken', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('skips verification in test environment', async () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('TURNSTILE_SECRET_KEY', undefined)
    expect(await verifyTurnstileToken(null)).toBe(true)
  })

  it('allows local dev when Turnstile is not configured', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('TURNSTILE_SECRET_KEY', undefined)
    expect(await verifyTurnstileToken(null)).toBe(true)
  })

  it('fails closed in production without secret key', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('VITEST', undefined)
    vi.stubEnv('TURNSTILE_SECRET_KEY', undefined)
    expect(isTurnstileConfigured()).toBe(false)
    expect(shouldSkipTurnstile()).toBe(false)
    expect(await verifyTurnstileToken('token')).toBe(false)
  })

  it('rejects missing token when secret is configured', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('VITEST', undefined)
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')
    expect(await verifyTurnstileToken(null)).toBe(false)
  })
})
