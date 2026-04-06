import { blogDocumentPreSave } from '@/models/blogDocumentPreSave'
import type { BlogPreSaveDoc } from '@/models/blogPreSave'
import { describe, expect, it, vi } from 'vitest'

describe('blogDocumentPreSave', () => {
  it('runs side effects and calls next', () => {
    const next = vi.fn()
    const doc: BlogPreSaveDoc = {
      isModified: () => false,
      readTime: 5
    }
    blogDocumentPreSave.call(doc, next)
    expect(next).toHaveBeenCalledOnce()
    expect(next.mock.calls[0]).toEqual([])
    expect(doc.readTime).toBe(5)
  })

  it('delegates to applyBlogPreSaveSideEffects when fields are modified', () => {
    const next = vi.fn()
    const words = Array.from({ length: 250 }, () => 'word').join(' ')
    const doc: BlogPreSaveDoc = {
      isModified: (p) => p === 'contentBlocks',
      readTime: 1,
      contentBlocks: [{ id: '1', type: 'text', order: 0, content: words }]
    }
    blogDocumentPreSave.call(doc, next)
    expect(doc.readTime).toBe(2)
    expect(next).toHaveBeenCalledOnce()
  })
})
