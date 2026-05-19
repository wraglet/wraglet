import getCurrentUser from '@/actions/getCurrentUser'
import User from '@/models/User'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PATCH } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/models/User', () => ({
  default: { findById: vi.fn() }
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn()
  }
}))

const mockedUser = vi.mocked(getCurrentUser)
const userFindById = vi.mocked(User.findById)

const validBody = {
  currentPassword: 'Oldpass1!',
  newPassword: 'Newpass1!'
}

describe('PATCH /api/users/password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without session', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await PATCH(
      buildAppRouteRequest('/api/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody)
      })
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 when new password fails validation', async () => {
    mockedUser.mockResolvedValue({ _id: 'u1' } as never)
    const res = await PATCH(
      buildAppRouteRequest('/api/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: 'x',
          newPassword: 'short'
        })
      })
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when current password is wrong', async () => {
    mockedUser.mockResolvedValue({ _id: 'u1' } as never)
    userFindById.mockResolvedValue({
      hashedPassword: 'stored-hash',
      save: vi.fn()
    } as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)
    const res = await PATCH(
      buildAppRouteRequest('/api/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody)
      })
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('Current password')
  })

  it('returns 200 on success', async () => {
    mockedUser.mockResolvedValue({ _id: 'u1' } as never)
    userFindById.mockResolvedValue({
      hashedPassword: 'stored-hash',
      save: vi.fn().mockResolvedValue(undefined)
    } as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
    vi.mocked(bcrypt.hash).mockResolvedValue('new-hash' as never)
    const res = await PATCH(
      buildAppRouteRequest('/api/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: 'Oldpass1!',
          newPassword: 'Newpass2!'
        })
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
