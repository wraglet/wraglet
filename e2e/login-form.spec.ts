import { expect, test } from '@playwright/test'

test('login submit is disabled until email and password are filled', async ({
  page
}) => {
  await page.goto('/')
  const submit = page.getByRole('button', { name: 'Login' })
  await expect(submit).toBeDisabled()

  await page.getByLabel('Email or Username').fill('user@example.com')
  await expect(submit).toBeDisabled()

  await page
    .locator('input[type="password"][name="password"]')
    .fill('not-a-real-password')
  await expect(submit).toBeEnabled()
})

test('Forgot Password control is reachable', async ({ page }) => {
  await page.goto('/')
  const forgotLink = page.getByRole('link', { name: 'Forgot Password?' })
  await expect(forgotLink).toBeVisible()
  await forgotLink.click()
  await expect(page).toHaveURL('/forgot-password')
})
