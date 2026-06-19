import { hashAuthToken } from '@/lib/auth/tokens'
import { getAppBaseUrl } from '@/lib/email/resendClient'
import User from '@/models/User'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/email/resendClient', () => ({
  getAppBaseUrl: vi.fn().mockReturnValue('http://localhost:5000')
}))

vi.mock('@/models/User', () => ({
  default: { findOneAndUpdate: vi.fn() }
}))

describe('GET /api/auth/verify-email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to login with error when token is missing', async () => {
    const res = await GET(
      buildAppRouteRequest('/api/auth/verify-email', { method: 'GET' })
    )
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost:5000/?error=invalid_verify_link'
    )
  })

  it('activates user and redirects on valid token', async () => {
    const token = 'valid-verify-token'
    vi.mocked(User.findOneAndUpdate).mockResolvedValue({
      _id: 'user-1',
      accountStatus: 'active',
      emailVerifiedAt: new Date()
    })

    const res = await GET(
      buildAppRouteRequest(`/api/auth/verify-email?token=${token}`, {
        method: 'GET'
      })
    )

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      {
        emailVerificationTokenHash: hashAuthToken(token),
        emailVerificationExpiresAt: { $gt: expect.any(Date) },
        accountStatus: { $nin: ['suspended', 'deleted'] }
      },
      expect.objectContaining({
        $set: expect.objectContaining({ accountStatus: 'active' }),
        $unset: expect.objectContaining({ emailVerificationTokenHash: '' })
      }),
      { new: true }
    )
    expect(res.headers.get('location')).toBe(`${getAppBaseUrl()}/?verified=1`)
  })
})
