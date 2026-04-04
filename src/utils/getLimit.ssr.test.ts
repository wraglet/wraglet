// @vitest-environment node
import { describe, expect, it } from 'vitest'

import getLimit from '@/utils/getLimit'

describe('getLimit (SSR / no window)', () => {
  it('returns default limit when window is undefined', () => {
    expect(getLimit()).toBe(20)
  })
})
