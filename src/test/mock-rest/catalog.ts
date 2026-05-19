import type { MockRestDefinition } from './types'

/**
 * Aggregates every `route.json` under the nested `api` tree (mirror of `src/app/api`).
 * Each file is one MockRestDefinition (see `types.ts`) or an array of them.
 *
 * Dynamic path segments use `:param` for MSW (e.g. `/api/posts/:postId`).
 * No fixtures for the session/OAuth catch-all under `src/app/api/auth/`.
 */

type RouteJsonFile = MockRestDefinition | MockRestDefinition[]

const routeModules = import.meta.glob<RouteJsonFile>('./api/**/route.json', {
  eager: true,
  import: 'default'
}) satisfies Record<string, RouteJsonFile>

const flatten = (file: RouteJsonFile): MockRestDefinition[] =>
  Array.isArray(file) ? file : [file]

export const MOCK_REST_CATALOG: MockRestDefinition[] =
  Object.values(routeModules).flatMap(flatten)
