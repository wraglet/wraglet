import { describe, expect, it } from 'vitest'

import {
  getConfirmPasswordMessage,
  getValidationMessages
} from '@/components/auth/password-validations'

describe('getValidationMessages', () => {
  it('returns null for empty password', () => {
    expect(getValidationMessages('')).toBeNull()
  })

  it('reports failing rules for weak passwords', () => {
    const msgs = getValidationMessages('abc')
    expect(msgs).toContain('❌ must be at least 8 characters')
    expect(msgs).toContain('❌ must contain at least one uppercase letter')
    expect(msgs).toContain('❌ must contain at least one number')
    expect(msgs).toContain('❌ must contain at least one special character')
  })

  it('flags missing uppercase separately when length and other rules pass', () => {
    const msgs = getValidationMessages('abcdefgh1!')
    expect(msgs).toContain('✔️ must be at least 8 characters')
    expect(msgs).toContain('❌ must contain at least one uppercase letter')
  })

  it('reports passing rules for strong passwords', () => {
    const msgs = getValidationMessages('GoodPass1!')
    expect(msgs?.every((m) => m.startsWith('✔️'))).toBe(true)
  })
})

describe('getConfirmPasswordMessage', () => {
  it('returns empty when confirm is empty', () => {
    expect(getConfirmPasswordMessage('x', '')).toBe('')
  })

  it('matches and mismatches', () => {
    expect(getConfirmPasswordMessage('secret', 'secret')).toBe(
      '✔️ Passwords match'
    )
    expect(getConfirmPasswordMessage('secret', 'other')).toBe(
      '❌ Passwords do not match'
    )
  })
})
