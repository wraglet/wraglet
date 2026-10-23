import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

const { postFindById, deleteObject, publish } = vi.hoisted(() => ({
  postFindById: vi.fn(),
  deleteObject: vi.fn(),
  publish: vi.fn()
}))

vi.mock('@/lib/db', () => ({ default: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/models/Post', () => ({ default: { findById: postFindById } }))
vi.mock('@/lib/posts/publishPostToFeed', () => ({ publishPostToFeed: publish }))
vi.mock('@/lib/media/uploadToR2', () => ({ deleteR2Object: deleteObject }))

const SECRET = 'video-secret'
const POST_ID = '507f1f77bcf86cd799439011'
const KEY = 'quarantine/videos/u1/a.mp4'

const send = (body: unknown, auth = `Bearer ${SECRET}`) =>
  POST(
    buildAppRouteRequest('/api/moderation/video-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: auth },
      body: JSON.stringify(body)
    })
  )

const makePost = (overrides: Record<string, unknown> = {}) => ({
  _id: { toString: () => POST_ID },
  moderationStatus: 'pending',
  moderationMeta: { pendingVideoKey: KEY, rawBytes: 1000 },
  content: {},
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides
})

const video = {
  key: `videos/${POST_ID}/master.mp4`,
  posterKey: `videos/${POST_ID}/poster.jpg`,
  durationSec: 12.5,
  width: 1280,
  height: 720
}

describe('POST /api/moderation/video-complete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.VIDEO_WORKER_SECRET = SECRET
    process.env.MODERATION_WORKER_SECRET = 'other-secret'
    process.env.NEXT_PUBLIC_R2_USERS_URL = 'https://r2.test/'
    delete process.env.MODERATION_STRICT_GRAY
    deleteObject.mockResolvedValue(undefined)
    publish.mockResolvedValue(null)
  })

  it('does not accept the image worker secret', async () => {
    const res = await send({ postId: POST_ID }, 'Bearer other-secret')
    expect(res.status).toBe(401)
  })

  it('validates the payload', async () => {
    const res = await send({ postId: 'not-an-id' })
    expect(res.status).toBe(400)
  })

  it('attaches derived URLs and publishes an approved video', async () => {
    const post = makePost()
    postFindById.mockResolvedValue(post)
    const res = await send({
      postId: POST_ID,
      quarantineKey: KEY,
      scores: { Neutral: 0.99 },
      decision: 'approve',
      video: { ...video, url: 'https://evil.example/x.mp4' }
    })
    expect(await res.json()).toMatchObject({ moderationStatus: 'approved' })
    expect(post.content).toEqual({
      video: {
        url: `https://r2.test/videos/${POST_ID}/master.mp4`,
        key: video.key,
        posterUrl: `https://r2.test/videos/${POST_ID}/poster.jpg`,
        posterKey: video.posterKey,
        durationSec: 12.5,
        width: 1280,
        height: 720
      }
    })
    expect(deleteObject).toHaveBeenCalledWith(KEY)
    expect(publish).toHaveBeenCalledWith(POST_ID)
  })

  it('keeps the post hidden when asset keys point outside the post prefix', async () => {
    const post = makePost()
    postFindById.mockResolvedValue(post)
    const res = await send({
      postId: POST_ID,
      quarantineKey: KEY,
      scores: { Neutral: 0.99 },
      video: { ...video, key: 'videos/507f1f77bcf86cd799439099/master.mp4' }
    })
    expect(await res.json()).toMatchObject({ moderationStatus: 'pending' })
    expect(post.content).toEqual({})
    expect(post.moderationMeta).toHaveProperty('pendingVideoKey', KEY)
    expect(deleteObject).not.toHaveBeenCalled()
    expect(publish).not.toHaveBeenCalled()
  })

  it('rejects explicit videos regardless of the worker decision', async () => {
    const post = makePost()
    postFindById.mockResolvedValue(post)
    const res = await send({
      postId: POST_ID,
      quarantineKey: KEY,
      decision: 'approve',
      scores: { Porn: 0.9 },
      video
    })
    expect(await res.json()).toMatchObject({ moderationStatus: 'rejected' })
    expect(post.content).toEqual({})
    expect(deleteObject).toHaveBeenCalledWith(KEY)
  })

  it('rejects on format/duration without touching scores', async () => {
    const post = makePost()
    postFindById.mockResolvedValue(post)
    const res = await send({
      postId: POST_ID,
      quarantineKey: KEY,
      rejectedReason: 'duration'
    })
    expect(await res.json()).toMatchObject({ moderationStatus: 'rejected' })
    expect(post.moderationMeta).toMatchObject({ rejectedReason: 'duration' })
  })

  it('keeps the quarantine object on a final failure (no video, review)', async () => {
    const post = makePost()
    postFindById.mockResolvedValue(post)
    const res = await send({
      postId: POST_ID,
      decision: 'review',
      error: 'Media Transformations timed out'
    })
    expect(await res.json()).toMatchObject({ moderationStatus: 'pending' })
    expect(post.moderationMeta).toMatchObject({
      pendingVideoKey: KEY,
      pipelineError: 'Media Transformations timed out'
    })
    expect(deleteObject).not.toHaveBeenCalled()
  })

  it('is idempotent for already processed posts', async () => {
    postFindById.mockResolvedValue(
      makePost({ moderationStatus: 'approved', moderationMeta: {} })
    )
    const res = await send({ postId: POST_ID, quarantineKey: KEY, video })
    expect(await res.json()).toEqual({ success: true, alreadyProcessed: true })
  })
})
