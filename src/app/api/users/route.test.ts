import { usersPatchSuccessSchema } from '@/contracts/usersApi'
import User from '@/models/User'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PATCH } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn().mockResolvedValue({
    _id: 'user-obj-id',
    email: 'user@test.local'
  })
}))

vi.mock('@/models/User', () => ({
  default: { findByIdAndUpdate: vi.fn() }
}))

describe('PATCH /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns { success, user } on valid update', async () => {
    vi.mocked(User.findByIdAndUpdate).mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: 'user-obj-id',
        firstName: 'Updated',
        lastName: 'Name',
        username: '@updated',
        email: 'user@test.local'
      })
    } as never)

    const res = await PATCH(
      buildAppRouteRequest('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Updated', bio: 'hello' })
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(usersPatchSuccessSchema.safeParse(json).success).toBe(true)
    expect(json.user.firstName).toBe('Updated')
    expect(User.findByIdAndUpdate).toHaveBeenCalled()
  })
})
