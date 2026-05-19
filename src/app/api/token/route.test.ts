import getCurrentUser from '@/actions/getCurrentUser'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

const { createTokenRequest } = vi.hoisted(() => ({
  createTokenRequest: vi.fn()
}))

vi.mock('ably', () => ({
  Rest: class RestMock {
    auth = { createTokenRequest }
  }
}))

const mockedUser = vi.mocked(getCurrentUser)

describe('GET /api/token', () => {
  const prevKey = process.env.ABLY_API_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ABLY_API_KEY = 'test.key:secret'
    createTokenRequest.mockResolvedValue({ token: 'tok' })
  })

  afterEach(() => {
    process.env.ABLY_API_KEY = prevKey
  })

  it('returns 401 without session', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 500 when ABLY_API_KEY is missing', async () => {
    mockedUser.mockResolvedValue({ _id: { toString: () => 'u1' } } as never)
    delete process.env.ABLY_API_KEY
    const res = await GET()
    expect(res.status).toBe(500)
  })

  it('returns token payload when configured', async () => {
    mockedUser.mockResolvedValue({ _id: { toString: () => 'u1' } } as never)
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ token: 'tok' })
    expect(createTokenRequest).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: 'u1' })
    )
  })
})
