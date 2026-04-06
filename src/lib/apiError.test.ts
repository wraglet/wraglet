import { safeApiError } from '@/lib/apiError'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('safeApiError', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns Error.message in non-production', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(safeApiError(new Error('db down'))).toBe('db down')
  })

  it('returns fallback for non-Error values in non-production', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(safeApiError('not an error', 'fallback')).toBe('fallback')
  })

  it('returns fallback in production even for Error instances', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(safeApiError(new Error('secret'), 'Try again')).toBe('Try again')
  })

  it('returns default fallback for non-Error values in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(safeApiError('oops')).toBe('Something went wrong')
  })
})
