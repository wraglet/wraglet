import { findUserByEmail } from '@/lib/auth/findUserByEmail'
import { hashAuthToken } from '@/lib/auth/tokens'
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail'
import User from '@/models/User'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST as forgotPassword } from './forgot-password/route'
import { POST as resetPassword } from './reset-password/route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/email/sendPasswordResetEmail', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/auth/findUserByEmail', () => ({
  findUserByEmail: vi.fn()
}))

vi.mock('@/models/User', () => ({
  default: { findOneAndUpdate: vi.fn() }
}))

describe('auth trust flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('forgot password then reset password completes the cycle', async () => {
    let capturedResetToken: string | undefined
    vi.mocked(sendPasswordResetEmail).mockImplementation(
      async (_email, token) => {
        capturedResetToken = token
      }
    )

    const save = vi.fn().mockResolvedValue(undefined)
    const activeUser = {
      email: 'user@example.com',
      accountStatus: 'active',
      emailVerifiedAt: new Date(),
      passwordResetTokenHash: undefined as string | undefined,
      passwordResetExpiresAt: undefined as Date | undefined,
      passwordResetRequestedAt: undefined as Date | undefined,
      hashedPassword: 'old-hash',
      save
    }

    vi.mocked(findUserByEmail).mockResolvedValue(activeUser)

    await forgotPassword(
      buildAppRouteRequest('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          turnstileToken: 'test'
        })
      })
    )

    expect(capturedResetToken).toBeDefined()
    if (!capturedResetToken) {
      throw new Error('Expected password reset token')
    }
    expect(activeUser.passwordResetTokenHash).toBe(
      hashAuthToken(capturedResetToken)
    )
    expect(save).toHaveBeenCalled()

    const resetUser = {
      _id: 'user-1',
      email: 'user@example.com',
      accountStatus: 'active',
      emailVerifiedAt: new Date(),
      passwordResetTokenHash: activeUser.passwordResetTokenHash,
      passwordResetExpiresAt: new Date(Date.now() + 60_000),
      passwordResetRequestedAt: new Date(),
      hashedPassword: 'old-hash',
      save: vi.fn().mockResolvedValue(undefined)
    }

    vi.mocked(User.findOneAndUpdate).mockImplementation(
      async (_query, update) => {
        resetUser.hashedPassword = update.$set.hashedPassword
        resetUser.accountStatus = update.$set.accountStatus
        resetUser.passwordChangedAt = update.$set.passwordChangedAt
        resetUser.emailVerifiedAt = update.$set.emailVerifiedAt
        resetUser.passwordResetTokenHash = undefined
        resetUser.passwordResetExpiresAt = undefined
        resetUser.passwordResetRequestedAt = undefined
        return resetUser
      }
    )

    const resetRes = await resetPassword(
      buildAppRouteRequest('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: capturedResetToken,
          password: 'New_pass1!'
        })
      })
    )

    expect(resetRes.status).toBe(200)
    expect(resetUser.passwordResetTokenHash).toBeUndefined()
    expect(await bcrypt.compare('New_pass1!', resetUser.hashedPassword)).toBe(
      true
    )
  })
})
