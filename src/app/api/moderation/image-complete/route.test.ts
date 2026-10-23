import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

const { postFindById, userFindById, userUpdate, copyToPublic, deleteObject } =
  vi.hoisted(() => ({
    postFindById: vi.fn(),
    userFindById: vi.fn(),
    userUpdate: vi.fn(),
    copyToPublic: vi.fn(),
    deleteObject: vi.fn()
  }))

vi.mock('@/lib/db', () => ({ default: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/models/Post', () => ({ default: { findById: postFindById } }))
vi.mock('@/models/User', () => ({
  default: { findById: userFindById, findByIdAndUpdate: userUpdate }
}))
vi.mock('@/lib/posts/publishPostToFeed', () => ({
  publishPostToFeed: vi.fn().mockResolvedValue(null)
}))
vi.mock('@/lib/media/uploadToR2', () => ({
  copyQuarantineToPublic: copyToPublic,
  deleteR2Object: deleteObject,
  getPublicPrefixForSurface: (s: string) => s
}))

const SECRET = 'worker-secret'
const POST_ID = '507f1f77bcf86cd799439011'
const KEY = 'quarantine/posts/u1/a.jpg'

const send = (body: unknown, auth = `Bearer ${SECRET}`) =>
  POST(
    buildAppRouteRequest('/api/moderation/image-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: auth },
      body: JSON.stringify(body)
    })
  )

const makePost = (overrides: Record<string, unknown> = {}) => ({
  _id: { toString: () => POST_ID },
  moderationStatus: 'pending',
  moderationMeta: { pendingImageKey: KEY },
  content: {},
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides
})

describe('POST /api/moderation/image-complete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.MODERATION_WORKER_SECRET = SECRET
    delete process.env.MODERATION_STRICT_GRAY
    copyToPublic.mockResolvedValue({
      url: 'https://r2/posts/x.jpg',
      key: 'posts/x.jpg'
    })
    deleteObject.mockResolvedValue(undefined)
  })

  it('rejects a bad bearer', async () => {
    const res = await send({ postId: POST_ID, key: KEY }, 'Bearer wrong')
    expect(res.status).toBe(401)
    expect(postFindById).not.toHaveBeenCalled()
  })

  it('rejects keys outside quarantine/', async () => {
    const res = await send({ postId: POST_ID, key: 'posts/u1/a.jpg' })
    expect(res.status).toBe(400)
    expect(copyToPublic).not.toHaveBeenCalled()
  })

  it('does not trust a lenient worker decision when scores say reject', async () => {
    const post = makePost()
    postFindById.mockResolvedValue(post)
    const res = await send({
      postId: POST_ID,
      key: KEY,
      surface: 'posts',
      decision: 'approve',
      scores: { Porn: 0.97 }
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ moderationStatus: 'rejected' })
    expect(deleteObject).toHaveBeenCalledWith(KEY)
    expect(copyToPublic).not.toHaveBeenCalled()
    expect(post.moderationStatus).toBe('rejected')
  })

  it('fails closed to needs_review when scores are empty', async () => {
    const post = makePost()
    postFindById.mockResolvedValue(post)
    const res = await send({
      postId: POST_ID,
      key: KEY,
      decision: 'approve',
      scores: {}
    })
    expect(await res.json()).toMatchObject({ moderationStatus: 'needs_review' })
  })

  it('approves and promotes a clean image', async () => {
    const post = makePost()
    postFindById.mockResolvedValue(post)
    const res = await send({
      postId: POST_ID,
      key: KEY,
      scores: { Neutral: 0.99, Porn: 0.001 }
    })
    expect(await res.json()).toMatchObject({ moderationStatus: 'approved' })
    expect(copyToPublic).toHaveBeenCalledWith(KEY, 'posts')
    expect(post.content).toEqual({
      images: [{ url: 'https://r2/posts/x.jpg', key: 'posts/x.jpg' }]
    })
    expect(post.moderationMeta).not.toHaveProperty('pendingImageKey')
  })

  it('is idempotent: ignores keys that are no longer pending', async () => {
    postFindById.mockResolvedValue(
      makePost({ moderationStatus: 'approved', moderationMeta: {} })
    )
    const res = await send({
      postId: POST_ID,
      key: KEY,
      scores: { Porn: 0.99 }
    })
    expect(await res.json()).toEqual({ success: true, alreadyProcessed: true })
    expect(deleteObject).not.toHaveBeenCalled()
    expect(copyToPublic).not.toHaveBeenCalled()
  })

  it('only applies profile media when the key matches the pending key', async () => {
    userFindById.mockReturnValue({
      select: () => ({
        lean: async () => ({
          pendingMedia: { avatarKey: 'quarantine/avatars/u1/other.jpg' }
        })
      })
    })
    const res = await send({
      userId: POST_ID,
      key: KEY,
      surface: 'avatars',
      scores: { Neutral: 0.99 }
    })
    expect(await res.json()).toEqual({ success: true, alreadyProcessed: true })
    expect(userUpdate).not.toHaveBeenCalled()
  })

  it('refuses surfaces it does not own', async () => {
    const res = await send({
      key: KEY,
      surface: 'posts',
      scores: { Neutral: 1 }
    })
    expect(res.status).toBe(400)
  })
})
