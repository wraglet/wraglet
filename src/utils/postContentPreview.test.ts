import { describe, expect, it } from 'vitest'

import { getPostContentPreviewSnippet } from './postContentPreview'

describe('getPostContentPreviewSnippet', () => {
  it('returns empty for nullish', () => {
    expect(getPostContentPreviewSnippet(undefined)).toBe('')
    expect(getPostContentPreviewSnippet(null)).toBe('')
  })

  it('handles string content', () => {
    expect(getPostContentPreviewSnippet('hi')).toBe('hi')
    const long = 'a'.repeat(60)
    expect(getPostContentPreviewSnippet(long)).toBe(`${'a'.repeat(50)}...`)
  })

  it('uses text from structured post content', () => {
    expect(getPostContentPreviewSnippet({ text: 'Hello world' })).toBe(
      'Hello world'
    )
  })

  it('falls back to blog title when no text', () => {
    expect(
      getPostContentPreviewSnippet({
        blogPreview: { title: 'My post', slug: 'x', url: '/' }
      })
    ).toBe('Blog: My post')
  })

  it('combines text and blog title with separator', () => {
    expect(
      getPostContentPreviewSnippet({
        text: 'Check this out',
        blogPreview: { title: 'Deep dive', slug: 'x', url: '/' }
      })
    ).toBe('Check this out · Blog: Deep dive')
  })
})
