import { expect, test } from '@playwright/test'

test('home shows sign-in when unauthenticated', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Welcome Back!' })
  ).toBeVisible()
})
