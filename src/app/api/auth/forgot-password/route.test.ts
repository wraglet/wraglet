import { AUTH_FEEDBACK } from '@/lib/auth/authMessages'
import { findUserByEmail } from '@/lib/auth/findUserByEmail'
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail'
import { _resetRateLimitStoreForTests } from '@/lib/trust/rateLimit'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/email/sendPasswordResetEmail', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/auth/findUserByEmail', () => ({
  findUserByEmail: vi.fn()
}))

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    _resetRateLimitStoreForTests()
    vi.mocked(findUserByEmail).mockResolvedValue(null)
  })

  it('returns the same message when user does not exist', async () => {
    const res = await POST(
      buildAppRouteRequest('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nobody@example.com',
          turnstileToken: 'test'
        })
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.message).toBe(AUTH_FEEDBACK.forgotPassword)
  })

  it('sends reset email for legacy users without accountStatus', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    vi.mocked(findUserByEmail).mockResolvedValue({
      email: 'legacy@example.com',
      save
    } as never)

    const res = await POST(
      buildAppRouteRequest('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'legacy@example.com',
          turnstileToken: 'test'
        })
      })
    )

    expect(res.status).toBe(200)
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'legacy@example.com',
      expect.any(String)
    )
  })

  it('does not send reset email for suspended users', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      email: 'bad@example.com',
      accountStatus: 'suspended',
      save: vi.fn()
    } as never)

    await POST(
      buildAppRouteRequest('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'bad@example.com',
          turnstileToken: 'test'
        })
      })
    )

    expect(sendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it('sends reset email for pending_verification users', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    vi.mocked(findUserByEmail).mockResolvedValue({
      email: 'pending@example.com',
      accountStatus: 'pending_verification',
      save
    } as never)

    await POST(
      buildAppRouteRequest('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'pending@example.com',
          turnstileToken: 'test'
        })
      })
    )

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'pending@example.com',
      expect.any(String)
    )
    expect(save).toHaveBeenCalled()
  })

  it('does not consume per-email send quota when the account does not exist', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    const request = (email: string) =>
      POST(
        buildAppRouteRequest('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, turnstileToken: 'test' })
        })
      )

    for (let i = 0; i < 3; i += 1) {
      await request('nobody@example.com')
    }

    vi.mocked(findUserByEmail).mockResolvedValue({
      email: 'spaueofficial@gmail.com',
      accountStatus: 'active',
      emailVerifiedAt: new Date(),
      save
    } as never)

    await request('spaueofficial@gmail.com')

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'spaueofficial@gmail.com',
      expect.any(String)
    )
  })

  it('rate limits repeated sends for the same registered email', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    vi.mocked(findUserByEmail).mockResolvedValue({
      email: 'active@example.com',
      accountStatus: 'active',
      emailVerifiedAt: new Date(),
      save
    } as never)

    const request = () =>
      POST(
        buildAppRouteRequest('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'active@example.com',
            turnstileToken: 'test'
          })
        })
      )

    await request()
    await request()
    await request()
    await request()

    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(3)
  })

  it('clears saved token when email send fails', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    vi.mocked(findUserByEmail).mockResolvedValue({
      email: 'user@example.com',
      accountStatus: 'active',
      emailVerifiedAt: new Date(),
      save
    } as never)
    vi.mocked(sendPasswordResetEmail).mockRejectedValue(
      new Error('send failed')
    )

    const res = await POST(
      buildAppRouteRequest('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          turnstileToken: 'test'
        })
      })
    )

    expect(res.status).toBe(200)
    expect(save).toHaveBeenCalledTimes(2)
  })
})
