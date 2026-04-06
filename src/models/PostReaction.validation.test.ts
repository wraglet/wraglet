import PostReaction from '@/models/PostReaction'
import mongoose from 'mongoose'
import { describe, expect, it } from 'vitest'

describe('PostReaction schema', () => {
  it('requires exactly one of postId or blogId', async () => {
    await expect(new PostReaction({ type: 'like' }).validate()).rejects.toThrow(
      /exactly one of postId or blogId/
    )

    const id = new mongoose.Types.ObjectId()
    await expect(
      new PostReaction({
        type: 'like',
        postId: id,
        blogId: id
      }).validate()
    ).rejects.toThrow(/exactly one of postId or blogId/)

    await new PostReaction({ type: 'like', postId: id }).validate()
    await new PostReaction({ type: 'like', blogId: id }).validate()
  })
})
