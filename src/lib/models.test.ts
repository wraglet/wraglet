import { describe, expect, it } from 'vitest'

import { initModels } from '@/lib/models'

describe('initModels', () => {
  it('reports all bundled models as registered on mongoose', () => {
    const flags = initModels()
    expect(Object.values(flags).every(Boolean)).toBe(true)
  })
})
