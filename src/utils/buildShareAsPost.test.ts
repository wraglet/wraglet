import type { IPost } from '@/models/Post'
import { describe, expect, it } from 'vitest'

import { buildShareAsPost } from './buildShareAsPost'

describe('buildShareAsPost', () => {
  it('keeps share id as _id for interaction URLs (not original post id)', () => {
    const originalPost = {
      _id: 'post-original',
      content: { text: 'orig' },
      audience: 'public',
      author: {
        _id: 'author-1',
        firstName: 'A',
        lastName: 'B',
        username: '@ab',
        gender: 'Female' as const,
        pronoun: 'They/Them' as const
      }
    } as unknown as IPost

    const share = {
      _id: 'share-card-id',
      originalPost,
      sharedBy: originalPost.author,
      visibility: 'public' as const,
      reactions: [],
      comments: [],
      votes: []
    } as Parameters<typeof buildShareAsPost>[0]

    const asPost = buildShareAsPost(share)
    expect(asPost._id).toBe('share-card-id')
    expect(asPost._id).not.toBe(originalPost._id)
    expect(asPost.originalPost).toBe(originalPost)
  })
})
