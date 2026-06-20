import { describe, expect, it } from 'vitest'

import {
  canonicalizeEmail,
  gmailDotCount,
  validateSignupEmail
} from './validateEmail'

describe('canonicalizeEmail', () => {
  it('normalizes gmail dots and plus tags', () => {
    expect(canonicalizeEmail('u.l.u.p.u.y.e.y@gmail.com')).toBe(
      'ulupuyey@gmail.com'
    )
    expect(canonicalizeEmail('user+spam@gmail.com')).toBe('user@gmail.com')
    expect(canonicalizeEmail('user@googlemail.com')).toBe('user@gmail.com')
  })

  it('leaves non-gmail addresses unchanged except lowercase', () => {
    expect(canonicalizeEmail('Person@Example.COM')).toBe('person@example.com')
  })
})

describe('gmailDotCount', () => {
  it('counts dots in gmail local part', () => {
    expect(gmailDotCount('a.b.c.d@gmail.com')).toBe(3)
  })
})

describe('validateSignupEmail', () => {
  it('rejects disposable domains', () => {
    const result = validateSignupEmail('bot@mailinator.com')
    expect(result.valid).toBe(false)
  })

  it('accepts valid addresses', () => {
    const result = validateSignupEmail('maria.garcia@example.com')
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.canonicalEmail).toBe('maria.garcia@example.com')
    }
  })
})
