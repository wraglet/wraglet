import getCurrentUser from '@/actions/getCurrentUser'
import User from '@/models/User'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PATCH } from './route'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/models/User', () => ({
  default: { findByIdAndUpdate: vi.fn(), findById: vi.fn() }
}))

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(function () {
    return {}
  })
}))

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: class UploadMock {
    done = vi.fn().mockResolvedValue({})
  }
}))

const mockedUser = vi.mocked(getCurrentUser)
const userFindByIdAndUpdate = vi.mocked(User.findByIdAndUpdate)

describe('PATCH /api/update-photo-collection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME = 'b'
    process.env.NEXT_PUBLIC_R2_USERS_URL = 'https://r2.test'
  })

  it('returns 401 when unauthenticated', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await PATCH(
      buildAppRouteRequest('/api/update-photo-collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', photos: [] })
      })
    )
    expect(res.status).toBe(401)
  })

  it('returns updated user for action update', async () => {
    mockedUser.mockResolvedValue({
      _id: 'u1',
      username: '@me'
    } as never)
    const doc = { _id: 'u1', photoCollection: [] }
    const q = {
      select: vi.fn().mockResolvedValue(doc)
    }
    userFindByIdAndUpdate.mockReturnValue(q as never)

    const res = await PATCH(
      buildAppRouteRequest('/api/update-photo-collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', photos: [] })
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body._id).toBe('u1')
  })
})
