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
  default: { findByIdAndUpdate: vi.fn() }
}))

vi.mock('@/utils/convertObjectIdsToStrings', () => ({
  convertObjectIdsToStrings: vi.fn((x: unknown) => x)
}))

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class S3Mock {
    send = vi.fn().mockResolvedValue({})
  },
  DeleteObjectCommand: vi.fn()
}))

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: class UploadMock {
    on = vi.fn()
    done = vi.fn().mockResolvedValue({})
  }
}))

const mockedUser = vi.mocked(getCurrentUser)
const findByIdAndUpdate = vi.mocked(User.findByIdAndUpdate)

const tinyPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('PATCH /api/update-cover-photo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME = 'b'
    process.env.NEXT_PUBLIC_R2_USERS_URL = 'https://r2.test'
  })

  it('returns 401 when unauthenticated', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await PATCH(
      buildAppRouteRequest('/api/update-cover-photo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverPhoto: tinyPng })
      })
    )
    expect(res.status).toBe(401)
  })

  it('returns 200 and user payload on success', async () => {
    mockedUser.mockResolvedValue({
      _id: 'u1',
      username: '@me',
      coverPhoto: null
    } as never)
    findByIdAndUpdate.mockResolvedValue({
      toObject: () => ({
        _id: 'u1',
        username: '@me',
        coverPhoto: { url: 'https://r2.test/cover/x.png', key: 'ck' }
      })
    } as never)

    const res = await PATCH(
      buildAppRouteRequest('/api/update-cover-photo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverPhoto: tinyPng })
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.coverPhoto?.url).toMatch(/r2\.test/)
  })
})
