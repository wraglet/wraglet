import {
  captureAuthEmailToken,
  isAuthTokenCaptureEnabled
} from '@/lib/email/captureAuthEmailToken'
import E2EAuthToken from '@/models/E2EAuthToken'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/models/E2EAuthToken', () => ({
  default: {
    findOneAndUpdate: vi.fn(),
    findOne: vi.fn()
  }
}))

describe('captureAuthEmailToken', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('is disabled in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('E2E_CAPTURE_AUTH_TOKENS', '1')
    expect(isAuthTokenCaptureEnabled()).toBe(false)
  })

  it('stores tokens when capture is enabled', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('E2E_CAPTURE_AUTH_TOKENS', '1')

    await captureAuthEmailToken('user@example.com', 'verify', 'abc123')

    expect(E2EAuthToken.findOneAndUpdate).toHaveBeenCalledWith(
      { email: 'user@example.com', kind: 'verify' },
      expect.objectContaining({ token: 'abc123' }),
      { upsert: true }
    )
  })
})
