import { execSync } from 'node:child_process'
import path from 'node:path'
import { config as loadEnv } from 'dotenv'

const root = path.resolve(__dirname, '..')
loadEnv({ path: path.join(root, '.env') })
loadEnv({ path: path.join(root, '.env.local'), override: true })

/**
 * Seeds the E2E user before tests when credentials are configured.
 * Loads `.env` / `.env.local` here so this process sees the same variables as `playwright.config.ts`.
 * Injects `E2E_SEED_ENABLED`; the seed script requires `@wraglet.local` email unless
 * `E2E_SEED_ALLOW_ANY_EMAIL` is set (see scripts/seed-e2e-user.ts).
 */
function globalSetup() {
  if (!process.env.E2E_TEST_USER_PASSWORD) {
    console.log(
      '[e2e] E2E_TEST_USER_PASSWORD not set — skipping MongoDB seed (authenticated E2E tests will skip)'
    )
    return
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      '[e2e] E2E_TEST_USER_PASSWORD is set but MONGODB_URI is missing. Add MONGODB_URI to .env or .env.local, start MongoDB, or unset E2E_TEST_USER_PASSWORD to run public E2E only (see docs/TESTING.md).'
    )
  }

  try {
    execSync('yarn seed:e2e', {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, E2E_SEED_ENABLED: 'true' }
    })
  } catch (err) {
    console.error(
      '[e2e] yarn seed:e2e failed. Check: MongoDB is reachable; MONGODB_URI; password meets sign-up rules; E2E_TEST_USER_EMAIL ends with @wraglet.local (or E2E_SEED_ALLOW_ANY_EMAIL); seeded blog slug not owned by another user (e2e/fixtures/seed-constants.ts). See docs/TESTING.md.'
    )
    throw err
  }
}

export default globalSetup
