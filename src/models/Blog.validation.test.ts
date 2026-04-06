import Blog from '@/models/Blog'
import mongoose from 'mongoose'
import { describe, expect, it } from 'vitest'

const validBlock = {
  id: 'b1',
  type: 'text' as const,
  order: 0,
  content: 'hello'
}

describe('Blog schema validation', () => {
  it('rejects empty contentBlocks array', async () => {
    const blog = new Blog({
      title: 'Title',
      summary: 'Summary',
      slug: 'slug-validation-test',
      category: 'Other',
      author: new mongoose.Types.ObjectId(),
      contentBlocks: []
    })
    await expect(blog.validate()).rejects.toThrow(
      /At least one content block is required/
    )
  })

  it('accepts at least one content block', async () => {
    const blog = new Blog({
      title: 'Title',
      summary: 'Summary',
      slug: 'slug-validation-ok',
      category: 'Other',
      author: new mongoose.Types.ObjectId(),
      contentBlocks: [validBlock]
    })
    await expect(blog.validate()).resolves.toBeUndefined()
  })
})
