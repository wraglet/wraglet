import { setupServer } from 'msw/node'

/**
 * Shared MSW Node server for Vitest. Default is **no handlers**; tests opt in with
 * `import { mswServer } from '@/test/msw/nodeServer'` then `mswServer.use(...)`.
 * Unhandled requests bypass (real `fetch` / undici) so existing suites stay unchanged.
 */
export const mswServer = setupServer()
