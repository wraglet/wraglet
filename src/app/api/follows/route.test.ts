import getCurrentUser from '@/actions/getCurrentUser'
import {
  followsFollowingIdsSchema,
  followsMutationSchema,
  followsProfileCountsSchema,
  followsUnauthorizedListSchema
} from '@/contracts/follows'
import { createFollowNotification } from '@/lib/notifications'
import Follow from '@/models/Follow'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DELETE, GET, POST } from './route'

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/lib/notifications', () => ({
  createFollowNotification: vi.fn()
}))

vi.mock('@/models/Follow', () => ({
  default: {
    find: vi.fn(),
    countDocuments: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn()
  }
}))

const mockedUser = vi.mocked(getCurrentUser)
const follow = vi.mocked(Follow)

const oid = '507f1f77bcf86cd799439011'
const oid2 = '507f1f77bcf86cd799439012'

describe('/api/follows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET returns 401 when unauthenticated and no userId query', async () => {
    mockedUser.mockResolvedValue(null)
    const res = await GET(buildAppRouteRequest('/api/follows'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(followsUnauthorizedListSchema.safeParse(body).success).toBe(true)
    expect(body.followingIds).toEqual([])
  })

  it('GET returns followingIds for the current user when no userId query', async () => {
    mockedUser.mockResolvedValue({
      _id: oid,
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedUser>>)
    follow.find.mockResolvedValue([
      { followingId: { toString: () => oid2 } }
    ] as never)

    const res = await GET(buildAppRouteRequest('/api/follows'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(followsFollowingIdsSchema.safeParse(body).success).toBe(true)
    expect(body).toEqual({ followingIds: [oid2] })
  })

  it('GET returns counts and isFollowing for a valid userId', async () => {
    mockedUser.mockResolvedValue({
      _id: oid,
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedUser>>)
    follow.countDocuments.mockResolvedValueOnce(3).mockResolvedValueOnce(7)
    follow.findOne.mockResolvedValue({ _id: 'f1' } as never)

    const res = await GET(buildAppRouteRequest(`/api/follows?userId=${oid2}`))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(followsProfileCountsSchema.safeParse(body).success).toBe(true)
    expect(body).toEqual({
      followersCount: 3,
      followingCount: 7,
      isFollowing: true
    })
  })

  it('POST creates follow and returns success', async () => {
    mockedUser.mockResolvedValue({
      _id: oid,
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedUser>>)
    follow.findOne.mockResolvedValue(null)
    follow.create.mockResolvedValue({} as never)

    const res = await POST(
      buildAppRouteRequest('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: oid2 })
      })
    )
    expect(res.status).toBe(200)
    const postOk = await res.json()
    expect(followsMutationSchema.safeParse(postOk).success).toBe(true)
    expect(postOk).toEqual({ success: true })
    expect(createFollowNotification).toHaveBeenCalledWith(oid, oid2)
  })

  it('POST returns 409 when already following', async () => {
    mockedUser.mockResolvedValue({
      _id: oid,
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedUser>>)
    follow.findOne.mockResolvedValue({ _id: 'existing' } as never)

    const res = await POST(
      buildAppRouteRequest('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: oid2 })
      })
    )
    expect(res.status).toBe(409)
    const errBody = await res.json()
    expect(followsMutationSchema.safeParse(errBody).success).toBe(true)
    expect(errBody.success).toBe(false)
  })

  it('DELETE removes follow', async () => {
    mockedUser.mockResolvedValue({
      _id: oid,
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedUser>>)
    follow.deleteOne.mockResolvedValue({ deletedCount: 1 } as never)

    const res = await DELETE(
      buildAppRouteRequest('/api/follows', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: oid2 })
      })
    )
    expect(res.status).toBe(200)
    const delOk = await res.json()
    expect(followsMutationSchema.safeParse(delOk).success).toBe(true)
    expect(delOk).toEqual({ success: true })
  })
})
