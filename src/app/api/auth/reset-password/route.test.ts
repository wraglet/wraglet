import User from '@/models/User'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/models/User', () => ({
  default: { findOneAndUpdate: vi.fn() }
}))

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('auto-verifies email and clears reset tokens on success', async () => {
    const user = {
      _id: 'user-1',
      email: 'legacy@example.com',
      accountStatus: 'active',
      emailVerifiedAt: new Date(),
      passwordChangedAt: new Date(),
      hashedPassword: 'hashed'
    }

    vi.mocked(User.findOneAndUpdate).mockResolvedValue(user)

    const res = await POST(
      buildAppRouteRequest('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'valid-token',
          password: 'New_pass1!'
        })
      })
    )

    expect(res.status).toBe(200)
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        passwordResetExpiresAt: { $gt: expect.any(Date) },
        accountStatus: { $nin: ['suspended', 'deleted'] }
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          accountStatus: 'active',
          passwordChangedAt: expect.any(Date)
        }),
        $unset: expect.objectContaining({
          passwordResetTokenHash: ''
        })
      }),
      { new: true }
    )
  })

  it('rejects invalid or expired tokens', async () => {
    vi.mocked(User.findOneAndUpdate).mockResolvedValue(null)

    const res = await POST(
      buildAppRouteRequest('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'valid-token',
          password: 'New_pass1!'
        })
      })
    )

    expect(res.status).toBe(400)
  })
})
