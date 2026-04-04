import { describe, expect, it } from 'vitest'

import { BLOG_CATEGORIES } from '@/models/Blog'

describe('BLOG_CATEGORIES', () => {
  it('is a non-empty readonly list with Other', () => {
    expect(BLOG_CATEGORIES.length).toBeGreaterThan(0)
    expect(BLOG_CATEGORIES).toContain('Other')
  })

  it('has no duplicate entries', () => {
    expect(new Set(BLOG_CATEGORIES).size).toBe(BLOG_CATEGORIES.length)
  })
})
