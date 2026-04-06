import { cn, generateUsername } from '@/lib/utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

const optionalClass = (): string | undefined => undefined
const truthyToken = (): string | undefined => 'on'

describe('cn', () => {
  it('merges tailwind classes and resolves conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('handles conditional class values', () => {
    expect(
      cn('base', optionalClass() && 'hidden', truthyToken() && 'block')
    ).toBe('base block')
  })
})

describe('generateUsername', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('builds @handle from names plus two-digit suffix', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(generateUsername('Ada', 'Lovelace')).toBe('@adalovelace10')
  })

  it('strips spaces from names before lowercasing', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    expect(generateUsername('Jean  Luc', 'Picard')).toBe('@jeanlucpicard99')
  })
})
