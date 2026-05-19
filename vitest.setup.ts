import '@testing-library/jest-dom/vitest'

import { mswServer } from '@/test/msw/nodeServer'
import { afterAll, afterEach, beforeAll } from 'vitest'

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: 'bypass' })
})

afterEach(() => {
  mswServer.resetHandlers()
})

afterAll(() => {
  mswServer.close()
})
