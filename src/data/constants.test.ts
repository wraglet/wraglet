import { describe, expect, it } from 'vitest'

import {
  DEFAULT_GENDER,
  DEFAULT_PRONOUN,
  GENDER_OPTIONS,
  GENDER_TO_DEFAULT_PRONOUN,
  MAX_BLOG_COMMENT_LENGTH,
  MAX_BLOG_CONTENT_BLOCKS,
  MAX_FILE_SIZE,
  PRONOUN_OPTIONS
} from '@/data/constants'

describe('constants', () => {
  it('exposes expected limits', () => {
    expect(MAX_FILE_SIZE).toBe(4 * 1024 * 1024)
    expect(MAX_BLOG_CONTENT_BLOCKS).toBe(80)
    expect(MAX_BLOG_COMMENT_LENGTH).toBe(2000)
  })

  it('keeps gender and pronoun lists in sync with defaults', () => {
    expect(GENDER_OPTIONS).toContain(DEFAULT_GENDER)
    expect(PRONOUN_OPTIONS).toContain(DEFAULT_PRONOUN)
    expect(GENDER_TO_DEFAULT_PRONOUN.Female).toBe('She/Her')
    expect(GENDER_TO_DEFAULT_PRONOUN.Male).toBe('He/Him')
    expect(GENDER_TO_DEFAULT_PRONOUN.Others).toBe('They/Them')
    expect(GENDER_TO_DEFAULT_PRONOUN['Prefer not to say']).toBe(
      'Prefer not to say'
    )
  })
})
