import { containsProfanity } from '@/lib/moderation/textModeration'
import { describe, expect, it } from 'vitest'

describe('textModeration', () => {
  it('blocks obvious profanity', () => {
    expect(containsProfanity('what the fuck')).toBe(true)
    expect(containsProfanity('you are a bitch')).toBe(true)
  })

  it('allows clean content', () => {
    expect(containsProfanity('Hello Wraglet community!')).toBe(false)
    expect(containsProfanity('Great day at the beach')).toBe(false)
  })

  it('allows documented false-positive place names', () => {
    expect(containsProfanity('I visited Scunthorpe last summer')).toBe(false)
    expect(containsProfanity('Classic literature is my favorite')).toBe(false)
  })

  it('blocks leetspeak evasions', () => {
    expect(containsProfanity('f u c k')).toBe(false)
    expect(containsProfanity('sh1t')).toBe(true)
  })
})
