import { execSync } from 'node:child_process'
import path from 'node:path'

/**
 * Seeds the E2E user before tests when credentials are configured.
 * Playwright config loads .env / .env.local first so this sees the same variables.
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

  const root = path.resolve(__dirname, '..')
  try {
    execSync('yarn seed:e2e', {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, E2E_SEED_ENABLED: 'true' }
    })
  } catch (err) {
    console.error(
      '[e2e] yarn seed:e2e failed — check MONGODB_URI, E2E_TEST_USER_PASSWORD, and that the email ends with @wraglet.local (or set E2E_SEED_ALLOW_ANY_EMAIL=true in isolated CI).'
    )
    throw err
  }
}

export default globalSetup
