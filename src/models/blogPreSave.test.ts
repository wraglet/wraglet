import {
  applyBlogPreSaveSideEffects,
  type BlogPreSaveDoc
} from '@/models/blogPreSave'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('applyBlogPreSaveSideEffects', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('computes readTime from text blocks when contentBlocks changed', () => {
    const words = Array.from({ length: 400 }, () => 'word').join(' ')
    const doc: BlogPreSaveDoc = {
      isModified: (p) => p === 'contentBlocks',
      readTime: 1,
      contentBlocks: [
        { id: '1', type: 'text', order: 0, content: words },
        { id: '2', type: 'code', order: 1, content: 'skip' }
      ]
    }
    applyBlogPreSaveSideEffects(doc)
    expect(doc.readTime).toBe(2)
  })

  it('does not count missing or whitespace-only text blocks toward word count', () => {
    const doc: BlogPreSaveDoc = {
      isModified: (p) => p === 'contentBlocks',
      readTime: 5,
      contentBlocks: [
        { id: '1', type: 'text', order: 0 },
        { id: '2', type: 'text', order: 1, content: '   ' },
        { id: '3', type: 'text', order: 2, content: 'one two three' }
      ]
    }
    applyBlogPreSaveSideEffects(doc)
    expect(doc.readTime).toBe(1)
  })

  it('does not change readTime when contentBlocks not modified', () => {
    const doc: BlogPreSaveDoc = {
      isModified: () => false,
      readTime: 3,
      contentBlocks: [{ id: '1', type: 'text', order: 0, content: 'hi' }]
    }
    applyBlogPreSaveSideEffects(doc)
    expect(doc.readTime).toBe(3)
  })

  it('sets publishedAt when status becomes published and unset', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'))
    const doc: BlogPreSaveDoc = {
      isModified: (p) => p === 'status',
      readTime: 1,
      status: 'published'
    }
    applyBlogPreSaveSideEffects(doc)
    expect(doc.publishedAt?.toISOString()).toBe('2026-01-15T12:00:00.000Z')
  })

  it('does not overwrite existing publishedAt', () => {
    const existing = new Date('2025-06-01T00:00:00.000Z')
    const doc: BlogPreSaveDoc = {
      isModified: (p) => p === 'status',
      readTime: 1,
      status: 'published',
      publishedAt: existing
    }
    applyBlogPreSaveSideEffects(doc)
    expect(doc.publishedAt).toBe(existing)
  })
})
