import type { MockRestDefinition } from '@/test/mock-rest/types'
import {
  delay,
  http,
  HttpResponse,
  passthrough,
  type HttpResponseResolver
} from 'msw'

/** MSW JSON body type (approximation — catalog fixtures are JSON-serializable). */
type MswJsonBody =
  | string
  | number
  | boolean
  | null
  | MswJsonBody[]
  | { [key: string]: MswJsonBody }

const methodFn = (method: MockRestDefinition['method']) => {
  const m = method.toLowerCase() as Lowercase<MockRestDefinition['method']>
  if (m === 'get') return http.get
  if (m === 'post') return http.post
  if (m === 'put') return http.put
  if (m === 'patch') return http.patch
  if (m === 'delete') return http.delete
  if (m === 'head') return http.head
  return http.options
}

const hasFixtureQuery = (entry: MockRestDefinition) =>
  typeof entry.query === 'string' && entry.query.trim() !== ''

/**
 * True if every `key=value` pair in the fixture `query` string is present on the request URL
 * (extra search params on the request are allowed).
 */
export const requestMatchesFixtureQuery = (
  requestUrl: string,
  entry: MockRestDefinition
): boolean => {
  if (!hasFixtureQuery(entry)) return true
  const fixture = new URLSearchParams(entry.query)
  const request = new URL(requestUrl).searchParams
  for (const [key, value] of fixture.entries()) {
    if (request.get(key) !== value) return false
  }
  return true
}

const toFullPath = (origin: string, route: string) => {
  const pathname = route.startsWith('/') ? route : `/${route}`
  return `${origin.replace(/\/$/, '')}${pathname}`
}

const groupKeyFor = (origin: string, entry: MockRestDefinition): string =>
  `${entry.method} ${toFullPath(origin, entry.route)}`

const sortEntriesForGroup = (group: MockRestDefinition[]) =>
  [...group].sort((a, b) => {
    const aq = hasFixtureQuery(a) ? 0 : 1
    const bq = hasFixtureQuery(b) ? 0 : 1
    if (aq !== bq) return aq - bq
    return 0
  })

/**
 * Turn catalog entries into MSW handlers. Pass a **stable origin** (e.g. Storybook or Vitest)
 * because MSW matches full URLs by default.
 *
 * **Path:** Dynamic segments in `route` use `:param` (MSW path syntax).
 *
 * **Query:** Entries with the same method + path are merged into one runtime handler. If an entry
 * has a non-empty `query`, it matches only when the request URL contains those exact param values.
 * Entries without `query` match any search string for that path. More specific (query) fixtures are
 * tried before wildcards. If nothing matches, the request **passthrough**s (real network), which with
 * Vitest `onUnhandledRequest: 'bypass'` leaves behavior unchanged.
 *
 * **Duplicates:** Several variants with the same path, method, and no `query` cannot be distinguished;
 * the first in catalog order wins. Narrow with `MOCK_REST_CATALOG.filter(...)` in tests.
 */
export const toMockRestHttpHandlers = (
  baseUrl: string,
  entries: MockRestDefinition[]
) => {
  const origin = baseUrl.replace(/\/$/, '')
  const groups = new Map<string, MockRestDefinition[]>()

  for (const entry of entries) {
    const key = groupKeyFor(origin, entry)
    const list = groups.get(key) ?? []
    list.push(entry)
    groups.set(key, list)
  }

  const handlers: ReturnType<typeof http.get>[] = []

  for (const [, group] of groups) {
    const sorted = sortEntriesForGroup(group)
    const sample = sorted[0]
    const path = toFullPath(origin, sample.route)
    const fn = methodFn(sample.method)
    const resolver: HttpResponseResolver = async ({ request }) => {
      const url = request.url
      for (const entry of sorted) {
        if (!requestMatchesFixtureQuery(url, entry)) continue
        if (entry.delay != null && entry.delay > 0) await delay(entry.delay)
        return HttpResponse.json(entry.responseBody as MswJsonBody, {
          status: entry.status
        })
      }
      return passthrough()
    }
    handlers.push(fn(path, resolver))
  }

  return handlers
}
