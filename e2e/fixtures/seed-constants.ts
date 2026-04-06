/**
 * Stable identifiers for `yarn seed:e2e` and Playwright authenticated specs.
 * Keep in sync with `scripts/seed-e2e-user.ts`.
 */
export const E2E_SEED_POST_ID = 'e2ead0000000000000000001'
export const E2E_SEED_BLOG_SLUG = 'e2e-welcome-blog'
export const E2E_SEED_BLOG_TITLE = 'E2E Welcome Blog'

/** Profile URL segment: user `username` field includes leading `@`. */
export function e2eProfilePath(usernameWithAt: string): string {
  const u = usernameWithAt.startsWith('@')
    ? usernameWithAt
    : `@${usernameWithAt}`
  return `/${u}`
}
