# PR Title

**feat(testing): TDD baseline with Vitest, Playwright E2E, seed tooling, and docs**

---

## Summary

This branch establishes a **documented testing standard** (Vitest + React Testing Library + Playwright), adds **colocated unit tests** and small **production-adjacent fixes** that support testability and correctness, and ships a **Playwright suite** with a **guarded MongoDB seed** for authenticated flows. Contributor-facing docs now point to **`docs/TESTING.md`** as the single source of truth.

## Commits (intent-ordered)

| Commit             | Intent                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `fix(db)`          | Read `MONGODB_URI` when connecting (not at module load) so CLI tools such as `yarn seed:e2e` can load `.env` after imports. |
| `refactor(models)` | Extract blog `pre('save')` logic into `blogPreSave` / `blogDocumentPreSave` with Vitest coverage.                           |
| `fix(utils)`       | Tighten `isPlainObject` in `convertObjectIdsToStrings` (shared refs, null-prototype objects); expanded tests.               |
| `refactor(hooks)`  | `useIsClient` uses `clientMountSync` + SSR test via `renderToStaticMarkup`.                                                 |
| `fix(api)`         | Trim `ABLY_API_KEY` in `GET /api/token` before Ably usage; aligns with E2E expectations.                                    |
| `test`             | Additional Vitest coverage: password validations, blog R2 cleanup, R2 client, chat floater, conversation display.           |
| `chore`            | `tsx`, `dotenv`; `yarn seed:e2e`; ESLint overrides for `e2e/**` and `scripts/**`; `commitlint` default export shape.        |
| `feat(e2e)`        | Playwright config (env load, global setup, webServer), E2E specs, `scripts/seed-e2e-user.ts`, `.env.example` E2E vars.      |
| `docs`             | `docs/TESTING.md`; Cursor rules link to it; `README` / `CONTRIBUTING` / `DEVELOPMENT` testing pointers.                     |

## Documentation

- **Canonical guide:** [`docs/TESTING.md`](../docs/TESTING.md) (stack, scripts, mocking, Playwright/E2E env, seed safety, TDD workflow).
- **Onboarding:** [`CONTRIBUTING.md`](../CONTRIBUTING.md), [`DEVELOPMENT.md`](../DEVELOPMENT.md), [`README.md`](../README.md).

## E2E and seed (operational notes)

- **Optional authenticated E2E:** set `E2E_TEST_USER_PASSWORD` (and test `MONGODB_URI`) in `.env` / `.env.local`. Global setup runs `yarn seed:e2e` with `E2E_SEED_ENABLED` injected.
- **Manual seed:** set `E2E_SEED_ENABLED=true` plus password and URI (see `.env.example`).
- **Safety:** seed refuses `NODE_ENV=production` / `VERCEL_ENV=production`, requires `E2E_SEED_ENABLED` for writes, and restricts email to **`@wraglet.local`** unless `E2E_SEED_ALLOW_ANY_EMAIL=true`.
- **Browsers (one-time):** `yarn test:e2e:install` before `yarn test:func`.

## Verification

```bash
yarn test
yarn lint
yarn build
# With E2E env + Mongo + dev stack as documented:
yarn test:func
# Or full gate (matches Husky pre-commit):
yarn validate
```

## Notes for reviewers

- **Husky `pre-commit`** runs `yarn validate` (includes Playwright). If commits were created with hooks skipped locally, run **`yarn validate`** before merge.
- **Production behavior:** small, targeted changes — `db` connection timing, `convertObjectIdsToStrings` plain-object detection, blog pre-save extraction (behavior preserved), Ably key trim, `useIsClient` implementation detail.
- **PR body copy:** You can paste this file into GitHub; the **PR Title** above is the suggested single-line title.

## Checklist (author)

- [ ] `yarn test` passes
- [ ] `yarn lint` passes
- [ ] `yarn build` passes
- [ ] `yarn test:func` passes with local E2E env (or confirm CI matrix covers it)
- [ ] No production secrets in `.env.example` or docs
