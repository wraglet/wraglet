# Wraglet testing standard

This document is the project source of truth for **automated testing**. It matches the **Cursor rules** (`.cursor/rules/wraglet.mdc` and `general.mdc`).

## Stack (Next.js 16, App Router)

| Layer            | Tool                                                                                        | Role                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Test runner      | **Vitest**                                                                                  | All non-browser automated tests: utilities, hooks, API route handlers (with mocks), and any integration-style tests run in Node or jsdom. |
| Components / DOM | **React Testing Library** + **@testing-library/user-event** + **@testing-library/jest-dom** | Render React trees and assert behavior from a user perspective, **inside** Vitest.                                                        |
| End-to-end       | **Playwright**                                                                              | Real browser, navigation, auth cookies, and flows that unit tests cannot cover reliably.                                                  |

**Do not add Jest** for new work. **Do not use RTL without Vitest** (or another runner); RTL does not execute tests.

**Next.js and Vite:** The app is built with `next dev` / `next build`, not Vite. Vitest may use Vite internally only to transform and run test files. Official Next.js testing guides cover **Vitest**, **Jest**, **Playwright**, and **Cypress**; Wraglet standardizes on the first and third of those for new tests.

**Async Server Components:** Next.js recommends leaning on **E2E** where `async` server components are hard to unit-test. Prefer Playwright for those surfaces until tooling catches up.

## Package manager

Use **yarn** only (see root `package.json` `packageManager`).

Suggested scripts once tooling is installed:

- `yarn test` — run Vitest once
- `yarn test:watch` — watch mode
- `yarn test:coverage` — coverage (e.g. `@vitest/coverage-v8`)
- `yarn test:func` / `yarn test:e2e` — Playwright (functional / E2E)
- `yarn test:e2e:ui` — Playwright UI mode
- `yarn validate` — `yarn format:check`, `yarn lint`, `yarn test`, `yarn test:func`, and `yarn build` (matches Husky `pre-commit`)
- `npx tsc --noEmit` — full-project TypeScript check without emitting files (fast feedback; `next build` also typechecks)
- `yarn seed:e2e` — upsert the Playwright E2E user in MongoDB **only when** `E2E_SEED_ENABLED=true` (or `1`) is set alongside `E2E_TEST_USER_PASSWORD` and `MONGODB_URI` (see Playwright notes below). **Not** invoked by `next build`, `next start`, or normal deploys.
- `yarn format` / `yarn format:check` — Prettier

## Linting (ESLint + Sonar)

`yarn lint` runs **ESLint 9** with Next.js, **eslint-plugin-sonarjs** (Sonar rule subset in CI), and **eslint-plugin-unicorn** on `src/contracts/**` and `src/test/mock-rest/**` for `prefer-export-from` (Sonar **S7763**).

The **SonarQube** extension in the IDE uses the full Sonar analyzer (broader than ESLint). Overlap is intentional: ESLint catches the same classes of issues on commit (`yarn validate`); Sonar in the editor can still flag additional rules. SonarJS rules are **errors** on contracts/mock-rest and **warnings** elsewhere until legacy UI code is cleaned up.

## Layout and naming

- Colocate **`*.test.ts`** and **`*.test.tsx`** next to the file under test (e.g. `mergePostClientUpdate.test.ts` beside `mergePostClientUpdate.ts`).
- Use **`// @vitest-environment jsdom`** at the top of files that need a DOM when the project default is `node`, or configure Vitest **projects** / per-pattern environments.

## What to test first

1. Pure functions in `src/lib`, `src/utils`, and small extracted helpers.
2. Hooks and presentational components (with mocks for Next.js, data providers, Ably).
3. Route handlers: import `GET`/`POST`/etc., build a `Request` / `NextRequest`, **`vi.mock('@/lib/db')`** and model modules as needed.
4. Critical paths in Playwright (smoke → grow).

## Mocking (typical)

- **Next.js:** `next/image`, `next/link`, `next/navigation` (and similar) as needed.
- **Auth:** session / `auth()` from NextAuth where routes depend on it.
- **Ably:** clients, channels, and hooks at module boundaries.
- **Database:** `@/lib/db` and Mongoose models — avoid real Mongo in unit tests unless using a dedicated test DB strategy.
- **HTTP (optional):** [MSW](https://mswjs.io/) Node server is started in **`vitest.setup.ts`** (`mswServer` from `@/test/msw/nodeServer`). It uses **`onUnhandledRequest: 'bypass'`** so existing tests are unchanged; opt in per test with `mswServer.use(http.get(...))`. Smoke test: `src/test/msw/mswSmoke.test.ts`.
- **API shapes:** Zod modules under **`src/contracts/`** and the human index **[`docs/API_CONTRACTS.md`](./API_CONTRACTS.md)**.

## Playwright notes

- Local dev server for this repo uses **port 5000** (`yarn dev`). Set Playwright **`baseURL`** to `http://localhost:5000` unless your workflow differs. Playwright uses **at most 4 workers** locally (1 in CI) so a single `next dev` process is not overloaded; login waits up to **20s** for the authenticated header (`role="banner"`).
- **`yarn test:func`** runs **`scripts/run-func-tests.ts`**, which starts **MongoDB in Docker** via **`docker-compose.e2e.yml`** on **localhost:27017** when nothing is already listening on **`127.0.0.1:27017`** (then Playwright). If Mongo is already up (host or container), compose is skipped. Requires Docker Desktop (or compatible engine) only when you need that container. If you manage Mongo yourself or use Atlas, set **`E2E_SKIP_DOCKER_MONGO=1`**. Prefer **`MONGODB_URI=mongodb://127.0.0.1:27017/...`** locally (especially on Windows) so Mongoose does not prefer **`::1`** while the server listens on IPv4 only.
- **Config loads `.env` then `.env.local`** (via `playwright.config.ts`) so E2E variables match what you use locally.
- **Authenticated flows:** Set `E2E_TEST_USER_PASSWORD` in `.env` or `.env.local` (password must meet the same rules as sign-up: length, upper, lower, digit, and a special character from `@$!%*?&#`). For **manual** `yarn seed:e2e`, also set **`E2E_SEED_ENABLED=true`** so the script is allowed to write to MongoDB. Optionally override `E2E_TEST_USER_EMAIL` (default `e2e-test@wraglet.local`) or `E2E_TEST_USER_USERNAME` (default `@e2e_wraglet`) if the default username is already taken by another account. When `E2E_TEST_USER_PASSWORD` is set, **`yarn test:func`** runs **`yarn seed:e2e`** once in global setup with `E2E_SEED_ENABLED` injected (you do not need that variable in `.env` for Playwright-only runs). If the password is not set, authenticated specs are skipped and only logged-out / public tests run.
- **Seed safety:** `scripts/seed-e2e-user.ts` exits immediately if `NODE_ENV=production` or `VERCEL_ENV=production`, and refuses to run without `E2E_SEED_ENABLED`. **`E2E_TEST_USER_EMAIL` must end with `@wraglet.local`** unless `E2E_SEED_ALLOW_ANY_EMAIL=true` (isolated sandboxes only). Use a **dedicated test database** URI locally and in CI; do not point production MongoDB at E2E credentials. Do not set `E2E_SEED_ENABLED` or `E2E_TEST_USER_PASSWORD` on production hosting.
- **Seeded content:** The same script upserts a stable **post** and **published blog** so E2E can hit `/post/:id`, `/blog/:slug`, `/blog/:slug/edit`, profile, and search-with-query flows. Stable ids and slug live in **`e2e/fixtures/seed-constants.ts`** (change there and in the seed script together). If another user already owns the default blog slug, either remove that blog or adjust the constant.
- **E2E layout (under `e2e/`):** `smoke`, `public-pages`, `public-api`, `navigation`, `login-form`, `auth-guard`; **`authenticated-journeys`** and **`authenticated-content`** (UI with seed); **`authenticated-flows`** (composer, settings nav, header search, blog→profile, mobile nav); **`authenticated-api`** — `page.request` against `/api/*` with the same session cookies after login.
- **Not exhaustively covered by Playwright** (use Vitest with mocks, a second test user, or dedicated E2E later): `POST`/`PATCH`/`DELETE` on most APIs, file uploads (R2), **Ably**-heavy chat send/receive, **admin** routes, **register** duplicate paths, **follow**/**comment**/**reaction**/**share** mutations, and any route without stable selectors. “Most” functional **read** paths for the main app shell and many **GET** APIs are exercised when `E2E_TEST_USER_PASSWORD` is set.
- Keep E2E tests stable: prefer role/name selectors, explicit waits over arbitrary timeouts, and documented test credentials or seed data.

## TDD workflow

For new behavior or bugfixes: write a failing test → implement the minimum to pass → refactor. Expand coverage in small PRs rather than blocking on “everything at once.”

## References

- [API contracts (JSON shapes)](./API_CONTRACTS.md)
- [Next.js: Testing](https://nextjs.org/docs/app/guides/testing)
- [Next.js: Vitest](https://nextjs.org/docs/app/guides/testing/vitest)
- [Vitest](https://vitest.dev/)
- [MSW](https://mswjs.io/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/)
