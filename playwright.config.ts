import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'
import { config as loadEnv } from 'dotenv'

const root = path.resolve(__dirname)
loadEnv({ path: path.join(root, '.env') })
loadEnv({ path: path.join(root, '.env.local'), override: true })

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Cap local workers so a single `next dev` is not overwhelmed (reduces flaky nav/hydration timeouts).
  workers: process.env.CI ? 1 : 4,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    navigationTimeout: 45_000
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
})
