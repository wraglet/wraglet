import { expect, type Page } from '@playwright/test'

const defaultEmail = 'e2e-test@wraglet.local'

export const loginAsE2EUser = async (page: Page) => {
  const email = (process.env.E2E_TEST_USER_EMAIL ?? defaultEmail).toLowerCase()
  const password = process.env.E2E_TEST_USER_PASSWORD
  if (!password) {
    throw new Error('E2E_TEST_USER_PASSWORD is required for loginAsE2EUser')
  }

  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Welcome Back!' })
  ).toBeVisible({ timeout: 15_000 })
  await page.getByLabel('Email or Username').fill(email)
  // `exact: true` — "Forgot Password?" also exposes an accessible name containing "Password".
  await page.getByLabel('Password', { exact: true }).fill(password)
  const loginButton = page.getByRole('button', { name: 'Login', exact: true })
  await expect(loginButton).toBeEnabled({ timeout: 10_000 })
  await loginButton.click()
  await expect(page).toHaveURL('/feed', { timeout: 45_000 })
  // Authenticated shell is client-rendered; default 5s is too tight under parallel `next dev` load.
  await expect(page.getByRole('banner')).toBeVisible({ timeout: 30_000 })
}
