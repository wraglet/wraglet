import { describe, expect, it } from 'vitest'

import { validateHumanName } from './validateHumanName'

describe('validateHumanName', () => {
  it('accepts normal international names', () => {
    expect(validateHumanName('Maria', 'García')).toEqual({ valid: true })
    expect(validateHumanName("O'Brien", 'Smith-Jones')).toEqual({ valid: true })
  })

  it('rejects bot-like random strings from admin screenshots', () => {
    const bot = validateHumanName('sWuHgCBpPKoBNEfZ', 'xK9mN2pQvR')
    expect(bot.valid).toBe(false)
  })

  it('rejects blocklisted and too-short names', () => {
    expect(validateHumanName('test', 'user').valid).toBe(false)
    expect(validateHumanName('A', 'Lee').valid).toBe(false)
  })
})
