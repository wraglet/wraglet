// @vitest-environment node

import getLimit from '@/utils/getLimit'
import { describe, expect, it } from 'vitest'

describe('getLimit (SSR / no window)', () => {
  it('returns default limit when window is undefined', () => {
    expect(getLimit()).toBe(20)
  })
})
