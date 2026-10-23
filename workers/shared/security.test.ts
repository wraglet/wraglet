import { describe, expect, it } from 'vitest'

import {
  isAllowedCallbackUrl,
  isBearerAuthorized,
  isObjectIdString,
  isQuarantineKey,
  timingSafeEqualString
} from './security'

describe('timingSafeEqualString / isBearerAuthorized', () => {
  it('matches identical strings only', () => {
    expect(timingSafeEqualString('abc', 'abc')).toBe(true)
    expect(timingSafeEqualString('abc', 'abd')).toBe(false)
    expect(timingSafeEqualString('abc', 'abcd')).toBe(false)
  })

  it('requires the exact bearer header', () => {
    expect(isBearerAuthorized('Bearer s3cret', 's3cret')).toBe(true)
    expect(isBearerAuthorized('Bearer s3cret ', 's3cret')).toBe(false)
    expect(isBearerAuthorized('bearer s3cret', 's3cret')).toBe(false)
    expect(isBearerAuthorized(null, 's3cret')).toBe(false)
    expect(isBearerAuthorized('Bearer ', '')).toBe(false)
    expect(isBearerAuthorized('Bearer x', undefined)).toBe(false)
  })
})

describe('isQuarantineKey', () => {
  it('accepts keys under quarantine/', () => {
    expect(isQuarantineKey('quarantine/posts/u1/a.jpg')).toBe(true)
    expect(isQuarantineKey('quarantine/videos/u1/a.mp4')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isQuarantineKey('posts/a.jpg')).toBe(false)
    expect(isQuarantineKey('quarantine/')).toBe(false)
    expect(isQuarantineKey('quarantine/../avatars/x.jpg')).toBe(false)
    expect(isQuarantineKey('quarantine//x.jpg')).toBe(false)
    expect(isQuarantineKey(42)).toBe(false)
  })
})

describe('isObjectIdString', () => {
  it('validates 24 hex chars', () => {
    expect(isObjectIdString('507f1f77bcf86cd799439011')).toBe(true)
    expect(isObjectIdString('../videos')).toBe(false)
    expect(isObjectIdString('507f1f77bcf86cd79943901')).toBe(false)
  })
})

describe('isAllowedCallbackUrl', () => {
  it('requires https except for localhost', () => {
    expect(
      isAllowedCallbackUrl('https://www.wraglet.com/api/x', undefined)
    ).toBe(true)
    expect(
      isAllowedCallbackUrl('http://www.wraglet.com/api/x', undefined)
    ).toBe(false)
    expect(isAllowedCallbackUrl('http://localhost:5000/api/x', undefined)).toBe(
      true
    )
    expect(isAllowedCallbackUrl('ftp://localhost/x', undefined)).toBe(false)
    expect(isAllowedCallbackUrl('not a url', undefined)).toBe(false)
    expect(isAllowedCallbackUrl(undefined, undefined)).toBe(false)
  })

  it('enforces the host allowlist when configured', () => {
    const hosts = 'www.wraglet.com, wraglet.com'
    expect(isAllowedCallbackUrl('https://www.wraglet.com/api/x', hosts)).toBe(
      true
    )
    expect(isAllowedCallbackUrl('https://WRAGLET.com/api/x', hosts)).toBe(true)
    expect(isAllowedCallbackUrl('https://evil.example/api/x', hosts)).toBe(
      false
    )
    expect(
      isAllowedCallbackUrl('https://www.wraglet.com.evil.example/x', hosts)
    ).toBe(false)
    expect(isAllowedCallbackUrl('http://localhost:5000/api/x', hosts)).toBe(
      false
    )
  })

  it('rejects embedded credentials', () => {
    expect(
      isAllowedCallbackUrl('https://user:pw@www.wraglet.com/api/x', undefined)
    ).toBe(false)
  })
})
