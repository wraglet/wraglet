/**
 * Fixture shape for documenting **route + method + status + example JSON body**.
 * Source of truth: one object (or array of objects) per handler in `route.json` files
 * under `src/test/mock-rest/api/` (mirror of `src/app/api/`).
 * Aggregated as `MOCK_REST_CATALOG` in `catalog.ts` for Storybook, MSW (`toMockRestHttpHandlers`), and tools.
 *
 * Human index: `docs/API_CONTRACTS.md`. Keep sample bodies aligned with `src/contracts/*`.
 */

export type MockRestHttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'

export type MockRestDefinition = {
  /** Path under the app, e.g. `/api/posts` or `/api/posts/:postId`. */
  route: string
  method: MockRestHttpMethod
  status: number
  /** Simulated latency in ms when using MSW or a local stub server. */
  delay?: number
  responseBody: unknown
  /**
   * Example query string without `?`, e.g. `feedType=trending&limit=10`.
   * Used by `toMockRestHttpHandlers` to pick among multiple mocks for the same path + method.
   */
  query?: string
  /** Notes for humans (error variant, auth required, etc.). */
  description?: string
}
