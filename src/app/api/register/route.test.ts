import User from '@/models/User'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/utils', () => ({
  generateUsername: vi.fn().mockReturnValue('@regtestuser')
}))

vi.mock('@/lib/email/sendVerificationEmail', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/models/User', () => ({
  default: {
    create: vi.fn(),
    findOne: vi.fn()
  }
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn()
  }
}))

const validBody = {
  firstName: 'Maria',
  lastName: 'Garcia',
  email: 'new@example.com',
  password: 'Str0ng!Pass',
  dob: '1990-01-01',
  gender: 'Female',
  pronoun: 'She/Her',
  publicProfileVisible: true,
  turnstileToken: 'test-token'
}

const GENERIC_REGISTER_ERROR =
  'Unable to create account. Check your details and try again.'

describe('POST /api/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(User.findOne).mockResolvedValue(null)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(
      buildAppRouteRequest('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'only@email.com' })
      })
    )
    expect(res.status).toBe(400)
  })

  it('rejects bot-like names', async () => {
    const res = await POST(
      buildAppRouteRequest('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validBody,
          firstName: 'sWuHgCBpPKoBNEfZ',
          lastName: 'xK9mN2pQvR'
        })
      })
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe(GENERIC_REGISTER_ERROR)
  })

  it('returns a generic error for disposable email domains', async () => {
    const res = await POST(
      buildAppRouteRequest('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validBody,
          email: 'user@mailinator.com'
        })
      })
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe(GENERIC_REGISTER_ERROR)
  })

  it('creates pending user and returns verify message', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-secret' as never)
    vi.mocked(User.create).mockResolvedValue({} as never)

    const res = await POST(
      buildAppRouteRequest('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody)
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.message).toMatch(/check your email/i)
    expect(json.email).toBe('new@example.com')
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@example.com',
        canonicalEmail: 'new@example.com',
        accountStatus: 'pending_verification',
        hashedPassword: 'hashed-secret'
      })
    )
  })

  it('returns generic success when canonical email already exists', async () => {
    vi.mocked(User.findOne).mockResolvedValue({ _id: 'existing' })

    const res = await POST(
      buildAppRouteRequest('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody)
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.message).toMatch(/inbox|verify/i)
    expect(User.create).not.toHaveBeenCalled()
  })
})
