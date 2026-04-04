import { afterEach, describe, expect, it } from 'vitest'

import getLimit from '@/utils/getLimit'

describe('getLimit (jsdom)', () => {
  afterEach(() => {
    window.innerWidth = 1024
  })

  it('returns 10 below 768px', () => {
    window.innerWidth = 320
    expect(getLimit()).toBe(10)
  })

  it('returns 20 at 768px and above', () => {
    window.innerWidth = 768
    expect(getLimit()).toBe(20)
    window.innerWidth = 2000
    expect(getLimit()).toBe(20)
  })
})
