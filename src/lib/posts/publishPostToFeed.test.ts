import { publishPostToFeed } from '@/lib/posts/publishPostToFeed'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { findById, followFind, publish, notify } = vi.hoisted(() => ({
  findById: vi.fn(),
  followFind: vi.fn(),
  publish: vi.fn(),
  notify: vi.fn()
}))

vi.mock('@/models/Post', () => ({
  default: { findById }
}))

vi.mock('@/models/Follow', () => ({
  default: { find: followFind }
}))

vi.mock('@/lib/ably', () => ({
  getAblyInstance: () => ({
    channels: { get: () => ({ publish }) }
  })
}))

vi.mock('@/lib/notifications', () => ({
  createNewPostNotification: notify
}))

const chain = (doc: unknown) => ({
  populate: () => chain(doc),
  lean: async () => doc
})

describe('publishPostToFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    publish.mockResolvedValue(undefined)
    notify.mockResolvedValue(undefined)
    followFind.mockReturnValue({
      select: () => ({
        lean: async () => [{ followerId: { toString: () => 'follower-1' } }]
      })
    })
  })

  it('does not broadcast or notify a post that is still pending', async () => {
    findById.mockReturnValue(
      chain({
        _id: 'post-1',
        moderationStatus: 'pending',
        author: { _id: 'author-1' }
      })
    )

    await expect(publishPostToFeed('post-1')).resolves.toBeNull()
    expect(publish).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()
  })

  it('publishes and notifies followers once the post is visible', async () => {
    findById.mockReturnValue(
      chain({
        _id: 'post-1',
        moderationStatus: 'approved',
        author: { _id: 'author-1' }
      })
    )

    await publishPostToFeed('post-1')

    expect(publish).toHaveBeenCalledWith('post', expect.anything())
    expect(notify).toHaveBeenCalledWith('author-1', ['follower-1'], 'post-1')
  })
})
