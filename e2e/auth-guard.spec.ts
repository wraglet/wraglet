import { expect, test } from '@playwright/test'

const protectedPaths = [
  '/feed',
  '/search',
  '/messages',
  '/settings',
  '/notifications',
  '/blog/dashboard'
]

for (const path of protectedPaths) {
  test(`${path} redirects to sign-in when logged out`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Welcome Back!' })
    ).toBeVisible()
  })
}
