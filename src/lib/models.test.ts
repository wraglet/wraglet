import { initModels } from '@/lib/models'
import { describe, expect, it } from 'vitest'

describe('initModels', () => {
  it('reports all bundled models as registered on mongoose', () => {
    const flags = initModels()
    expect(Object.values(flags).every(Boolean)).toBe(true)
  })
})
