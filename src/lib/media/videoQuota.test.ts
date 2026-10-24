import {
  assertUserCanUploadVideo,
  releaseVideoUploadQuota,
  VideoQuotaError
} from '@/lib/media/videoQuota'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { findById, updateOne } = vi.hoisted(() => ({
  findById: vi.fn(),
  updateOne: vi.fn()
}))

vi.mock('@/models/User', () => ({
  default: { findById, updateOne }
}))

const leanUser = (doc: unknown) => ({
  select: () => ({ lean: async () => doc })
})

describe('assertUserCanUploadVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    findById.mockImplementation(() => leanUser({}))
    updateOne.mockResolvedValue({ matchedCount: 1 })
  })

  it('reserves the upload in one conditional update', async () => {
    await assertUserCanUploadVideo('user-1', 1024)

    expect(updateOne).toHaveBeenCalledOnce()
    const [filter, update] = updateOne.mock.calls[0]
    expect(filter._id).toBe('user-1')
    expect(JSON.stringify(filter.$or)).toContain('videoUploadUsage.count')
    expect(JSON.stringify(filter.$or)).toContain('videoUploadUsage.bytes')
    expect(Array.isArray(update)).toBe(true)
  })

  it('does not reserve when the conditional update matches nobody', async () => {
    updateOne.mockResolvedValue({ matchedCount: 0 })
    findById.mockImplementation(() =>
      leanUser({
        videoUploadUsage: {
          windowStart: new Date(),
          count: 5,
          bytes: 0
        }
      })
    )

    await expect(
      assertUserCanUploadVideo('user-1', 1024)
    ).rejects.toMatchObject({
      message: 'Daily video upload limit reached',
      status: 429
    })
    expect(updateOne).toHaveBeenCalledOnce()
  })

  it('rejects an oversized file before touching the counter', async () => {
    await expect(
      assertUserCanUploadVideo('user-1', 209715200 + 1)
    ).rejects.toBeInstanceOf(VideoQuotaError)
    expect(updateOne).not.toHaveBeenCalled()
  })

  it('rejects a restricted user before reserving', async () => {
    findById.mockImplementation(() =>
      leanUser({ uploadRestrictedUntil: new Date(Date.now() + 60_000) })
    )

    await expect(
      assertUserCanUploadVideo('user-1', 1024)
    ).rejects.toMatchObject({ status: 403 })
    expect(updateOne).not.toHaveBeenCalled()
  })
})

describe('releaseVideoUploadQuota', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updateOne.mockResolvedValue({ matchedCount: 1 })
  })

  it('decrements the reservation only inside the current window', async () => {
    await releaseVideoUploadQuota('user-1', 1024)
    const [filter, update] = updateOne.mock.calls[0]
    expect(filter['videoUploadUsage.bytes']).toEqual({ $gte: 1024 })
    expect(update).toEqual({
      $inc: {
        'videoUploadUsage.count': -1,
        'videoUploadUsage.bytes': -1024
      }
    })
  })
})
