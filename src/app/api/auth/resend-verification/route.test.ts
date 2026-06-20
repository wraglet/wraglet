import { AUTH_FEEDBACK } from '@/lib/auth/authMessages'
import { enrollUserForEmailVerification } from '@/lib/auth/enrollEmailVerification'
import { findUserByEmail } from '@/lib/auth/findUserByEmail'
import { _resetRateLimitStoreForTests } from '@/lib/trust/rateLimit'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/auth/findUserByEmail', () => ({
  findUserByEmail: vi.fn()
}))

vi.mock('@/lib/auth/enrollEmailVerification', () => ({
  enrollUserForEmailVerification: vi.fn().mockResolvedValue(undefined)
}))

describe('POST /api/auth/resend-verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    _resetRateLimitStoreForTests()
    vi.mocked(findUserByEmail).mockResolvedValue(null)
  })

  it('returns generic message when user does not exist', async () => {
    const res = await POST(
      buildAppRouteRequest('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nobody@example.com' })
      })
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      message: AUTH_FEEDBACK.resendVerification
    })
    expect(enrollUserForEmailVerification).not.toHaveBeenCalled()
  })

  it('enrolls pending user and returns generic message', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      email: 'pending@example.com',
      accountStatus: 'pending_verification'
    })

    const res = await POST(
      buildAppRouteRequest('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'pending@example.com' })
      })
    )

    expect(res.status).toBe(200)
    expect(enrollUserForEmailVerification).toHaveBeenCalled()
  })

  it('does not consume email send quota when user does not exist', async () => {
    const request = (email: string) =>
      POST(
        buildAppRouteRequest('/api/auth/resend-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
      )

    for (let i = 0; i < 3; i += 1) {
      await request('nobody@example.com')
    }

    vi.mocked(findUserByEmail).mockResolvedValue({
      email: 'pending@example.com',
      accountStatus: 'pending_verification'
    })

    await request('pending@example.com')

    expect(enrollUserForEmailVerification).toHaveBeenCalledTimes(1)
  })
})
