import getCurrentUser from '@/actions/getCurrentUser'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/lib/r2S3Client', () => ({
  createR2S3Client: vi.fn().mockReturnValue({
    send: vi.fn().mockResolvedValue({})
  })
}))

vi.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: vi.fn()
}))

const mockedUser = vi.mocked(getCurrentUser)

const tinyPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('POST /api/blogs/upload-image', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME = 'bucket'
    process.env.NEXT_PUBLIC_R2_USERS_URL = 'https://r2.test'
  })

  it('returns 401 when unauthenticated', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await POST(
      buildAppRouteRequest('/api/blogs/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: tinyPng })
      })
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 when image missing', async () => {
    mockedUser.mockResolvedValue({
      _id: 'u1',
      email: 'a@b.c'
    } as never)
    const res = await POST(
      buildAppRouteRequest('/api/blogs/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
    )
    expect(res.status).toBe(400)
  })

  it('returns url and key on success', async () => {
    mockedUser.mockResolvedValue({
      _id: 'u1',
      email: 'a@b.c'
    } as never)
    const res = await POST(
      buildAppRouteRequest('/api/blogs/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: tinyPng, type: 'content' })
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toMatch(/^https:\/\/r2\.test\//)
    expect(typeof body.key).toBe('string')
  })
})
