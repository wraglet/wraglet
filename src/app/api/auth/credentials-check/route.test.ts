import { enrollUserForEmailVerification } from '@/lib/auth/enrollEmailVerification'
import { findUserByCredential } from '@/lib/auth/resolveCredentialUser'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/auth/resolveCredentialUser', () => ({
  findUserByCredential: vi.fn()
}))

vi.mock('@/lib/auth/enrollEmailVerification', () => ({
  enrollUserForEmailVerification: vi.fn().mockResolvedValue(undefined)
}))

describe('POST /api/auth/credentials-check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(findUserByCredential).mockResolvedValue(null)
  })

  it('returns ok false for unknown user', async () => {
    const res = await POST(
      buildAppRouteRequest('/api/auth/credentials-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: 'nobody@example.com',
          password: 'secret'
        })
      })
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: false })
  })

  it('returns needsVerification without sending email on login', async () => {
    const hashedPassword = await bcrypt.hash('correct-pass', 4)
    vi.mocked(findUserByCredential).mockResolvedValue({
      _id: 'legacy-id',
      email: 'legacy@example.com',
      hashedPassword
    } as never)

    const res = await POST(
      buildAppRouteRequest('/api/auth/credentials-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: 'legacy@example.com',
          password: 'correct-pass'
        })
      })
    )

    expect(await res.json()).toEqual({
      ok: false,
      needsVerification: true,
      email: 'legacy@example.com'
    })
    expect(enrollUserForEmailVerification).not.toHaveBeenCalled()
  })

  it('returns ok true for verified user', async () => {
    const hashedPassword = await bcrypt.hash('correct-pass', 4)
    vi.mocked(findUserByCredential).mockResolvedValue({
      _id: 'verified-id',
      email: 'verified@example.com',
      hashedPassword,
      accountStatus: 'active',
      emailVerifiedAt: new Date()
    } as never)

    const res = await POST(
      buildAppRouteRequest('/api/auth/credentials-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: 'verified@example.com',
          password: 'correct-pass'
        })
      })
    )

    expect(await res.json()).toEqual({ ok: true })
    expect(enrollUserForEmailVerification).not.toHaveBeenCalled()
  })
})
