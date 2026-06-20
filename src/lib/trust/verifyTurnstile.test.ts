import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  isTurnstileConfigured,
  shouldSkipTurnstile,
  verifyTurnstileToken
} from './verifyTurnstile'

describe('verifyTurnstileToken', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('skips verification in test environment', async () => {
    process.env.NODE_ENV = 'test'
    delete process.env.TURNSTILE_SECRET_KEY
    expect(await verifyTurnstileToken(null)).toBe(true)
  })

  it('allows local dev when Turnstile is not configured', async () => {
    process.env.NODE_ENV = 'development'
    delete process.env.TURNSTILE_SECRET_KEY
    expect(await verifyTurnstileToken(null)).toBe(true)
  })

  it('fails closed in production without secret key', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.VITEST
    delete process.env.TURNSTILE_SECRET_KEY
    expect(isTurnstileConfigured()).toBe(false)
    expect(shouldSkipTurnstile()).toBe(false)
    expect(await verifyTurnstileToken('token')).toBe(false)
  })

  it('rejects missing token when secret is configured', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.VITEST
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    expect(await verifyTurnstileToken(null)).toBe(false)
  })
})
