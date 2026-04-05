import { expect, test } from '@playwright/test'

/** Routes that stay on the unauthenticated shell and expose a stable level-1 heading. */
const publicPages: { path: string; heading: string }[] = [
  { path: '/help', heading: 'Help' },
  { path: '/changelog', heading: 'Wraglet Changelog' },
  { path: '/terms-of-service', heading: 'Terms of Service' },
  { path: '/privacy-policy', heading: 'Privacy Policy' },
  { path: '/cookie-policy', heading: 'Cookie Policy' },
  { path: '/advertising', heading: 'Advertising' }
]

for (const { path, heading } of publicPages) {
  test(`${path} shows primary heading`, async ({ page }) => {
    await page.goto(path)
    await expect(
      page.getByRole('heading', { level: 1, name: heading })
    ).toBeVisible()
  })
}

test('/register shows sign-up heading', async ({ page }) => {
  await page.goto('/register')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Create an account' })
  ).toBeVisible()
})
