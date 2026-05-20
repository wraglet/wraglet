import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const apiRoot = path.join(process.cwd(), 'src/app/api')
const mockRoot = path.join(process.cwd(), 'src/test/mock-rest/api')

const collectRouteFiles = (dir: string, base = ''): string[] => {
  const entries = readdirSync(dir)
  const files: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry)
    const rel = base ? `${base}/${entry}` : entry
    if (statSync(full).isDirectory()) {
      files.push(...collectRouteFiles(full, rel))
    } else if (entry === 'route.ts') {
      files.push(rel.replaceAll('\\', '/').replace(/\/route\.ts$/, ''))
    }
  }
  return files
}

const routeModuleToMockPath = (routeModule: string) => {
  const segments = routeModule.split('/')
  const mockSegments = segments.map((s) =>
    s.startsWith('[') && s.endsWith(']') ? `[${s.slice(1, -1)}]` : s
  )
  return path.join(mockRoot, ...mockSegments, 'route.json')
}

describe('mock-rest route coverage', () => {
  it('every API route module has route.json except NextAuth catch-all', () => {
    const routeModules = collectRouteFiles(apiRoot)
    expect(routeModules).toHaveLength(35)

    const withoutAuth = routeModules.filter((m) => m !== 'auth/[...nextauth]')
    expect(withoutAuth).toHaveLength(34)

    for (const modulePath of withoutAuth) {
      const mockPath = routeModuleToMockPath(modulePath)
      expect(statSync(mockPath).isFile(), `missing mock: ${mockPath}`).toBe(
        true
      )
    }
  })

  it('does not mock NextAuth catch-all (E2E / NextAuth only)', () => {
    const authMock = routeModuleToMockPath('auth/[...nextauth]')
    expect(() => statSync(authMock)).toThrow()
  })
})
