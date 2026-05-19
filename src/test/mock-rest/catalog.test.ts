import { describe, expect, it } from 'vitest'

import { MOCK_REST_CATALOG } from './catalog'
import type { MockRestDefinition } from './types'

type RouteJsonFile = MockRestDefinition | MockRestDefinition[]

const routeJsonModules = import.meta.glob<RouteJsonFile>(
  './api/**/route.json',
  {
    eager: true,
    import: 'default'
  }
) satisfies Record<string, RouteJsonFile>

const countDefinitions = (file: RouteJsonFile) =>
  Array.isArray(file) ? file.length : 1

describe('MOCK_REST_CATALOG', () => {
  it('every route.json file is present and definitions match aggregate length', () => {
    const filePaths = Object.keys(routeJsonModules)
    expect(filePaths.length).toBe(33)

    const expectedTotal = Object.values(routeJsonModules).reduce(
      (sum, file) => sum + countDefinitions(file),
      0
    )
    expect(MOCK_REST_CATALOG.length).toBe(expectedTotal)
  })

  it('every entry has route, method, status, and responseBody', () => {
    for (const row of MOCK_REST_CATALOG) {
      expect(row.route).toMatch(/^\//)
      expect(typeof row.method).toBe('string')
      expect(row.status).toBeGreaterThanOrEqual(100)
      expect(row.status).toBeLessThan(600)
      expect('responseBody' in row).toBe(true)
    }
  })

  it('serializes to JSON like external mock-rest tools', () => {
    const [first] = MOCK_REST_CATALOG
    const json = structuredClone(first) as Record<string, unknown>
    expect(json.route).toBeDefined()
    expect(json.method).toBeDefined()
    expect(json.status).toBeDefined()
    expect(json.responseBody).toBeDefined()
  })
})
