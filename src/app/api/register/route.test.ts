import { registerCreatedUserSchema } from '@/contracts/register'
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

vi.mock('@/models/User', () => ({
  default: { create: vi.fn() }
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn()
  }
}))

const validBody = {
  firstName: 'Reg',
  lastName: 'User',
  email: 'new@example.com',
  password: 'Str0ng!Pass',
  dob: '1990-01-01',
  gender: 'Female',
  pronoun: 'she/her',
  publicProfileVisible: true
}

describe('POST /api/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    expect(await res.text()).toBe('Missing info')
  })

  it('creates user and returns JSON', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-secret' as never)
    const created = {
      _id: 'uid1',
      firstName: 'Reg',
      lastName: 'User',
      email: 'new@example.com',
      username: '@regtestuser'
    }
    vi.mocked(User.create).mockResolvedValue(created as never)

    const res = await POST(
      buildAppRouteRequest('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody)
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(registerCreatedUserSchema.safeParse(json).success).toBe(true)
    expect(json.email).toBe('new@example.com')
    expect(json.username).toBe('@regtestuser')
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@example.com',
        hashedPassword: 'hashed-secret'
      })
    )
  })

  it('returns 409 when email already exists', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-secret' as never)
    vi.mocked(User.create).mockRejectedValue({ code: 11000 })

    const res = await POST(
      buildAppRouteRequest('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody)
      })
    )
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toMatch(/email|exists/i)
  })
})
