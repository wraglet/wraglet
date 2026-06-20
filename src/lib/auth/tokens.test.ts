import { describe, expect, it } from 'vitest'

import { generateAuthToken, hashAuthToken, verifyAuthToken } from './tokens'

describe('auth tokens', () => {
  it('hashes and verifies opaque tokens', () => {
    const token = generateAuthToken()
    const hash = hashAuthToken(token)
    expect(verifyAuthToken(token, hash)).toBe(true)
    expect(verifyAuthToken('wrong', hash)).toBe(false)
  })
})
