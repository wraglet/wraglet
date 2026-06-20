import { describe, expect, it } from 'vitest'

import {
  canRequestPasswordReset,
  canUserSignIn,
  isEmailVerified,
  needsEmailVerification
} from './accountAccess'

describe('isEmailVerified', () => {
  it('is false without emailVerifiedAt', () => {
    expect(isEmailVerified({})).toBe(false)
    expect(isEmailVerified({ accountStatus: 'active' })).toBe(false)
  })

  it('is true when emailVerifiedAt is set', () => {
    expect(isEmailVerified({ emailVerifiedAt: new Date() })).toBe(true)
  })
})

describe('canUserSignIn', () => {
  it('blocks legacy and unverified users', () => {
    expect(canUserSignIn({})).toBe(false)
    expect(canUserSignIn({ accountStatus: 'pending_verification' })).toBe(false)
    expect(
      canUserSignIn({ accountStatus: 'active', emailVerifiedAt: undefined })
    ).toBe(false)
  })

  it('allows verified active users', () => {
    expect(
      canUserSignIn({
        accountStatus: 'active',
        emailVerifiedAt: new Date()
      })
    ).toBe(true)
  })

  it('blocks suspended and deleted users', () => {
    expect(
      canUserSignIn({
        accountStatus: 'suspended',
        emailVerifiedAt: new Date()
      })
    ).toBe(false)
  })
})

describe('canRequestPasswordReset', () => {
  it('allows legacy and active users', () => {
    expect(canRequestPasswordReset({})).toBe(true)
    expect(
      canRequestPasswordReset({
        accountStatus: 'active',
        emailVerifiedAt: new Date()
      })
    ).toBe(true)
  })

  it('allows pending_verification users', () => {
    expect(
      canRequestPasswordReset({ accountStatus: 'pending_verification' })
    ).toBe(true)
  })

  it('blocks suspended and deleted users', () => {
    expect(canRequestPasswordReset({ accountStatus: 'suspended' })).toBe(false)
    expect(canRequestPasswordReset({ accountStatus: 'deleted' })).toBe(false)
  })
})

describe('needsEmailVerification', () => {
  it('is true for legacy and pending users without verified email', () => {
    expect(needsEmailVerification({})).toBe(true)
    expect(
      needsEmailVerification({ accountStatus: 'pending_verification' })
    ).toBe(true)
  })

  it('is false for verified users and blocked accounts', () => {
    expect(
      needsEmailVerification({
        accountStatus: 'active',
        emailVerifiedAt: new Date()
      })
    ).toBe(false)
    expect(needsEmailVerification({ accountStatus: 'suspended' })).toBe(false)
  })
})
