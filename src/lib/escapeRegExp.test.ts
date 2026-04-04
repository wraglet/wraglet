import { describe, expect, it } from 'vitest'

import { escapeRegExp } from '@/lib/escapeRegExp'

describe('escapeRegExp', () => {
  it('escapes regex metachacters for safe MongoDB $regex use', () => {
    expect(escapeRegExp('a+b')).toBe(String.raw`a\+b`)
    expect(escapeRegExp('foo.bar*baz')).toBe(String.raw`foo\.bar\*baz`)
    expect(escapeRegExp('^$()[]{}|\\')).toBe(
      String.raw`\^\$\(\)\[\]\{\}\|\\`
    )
  })

  it('returns empty string for empty input', () => {
    expect(escapeRegExp('')).toBe('')
  })
})
