import { expect, type Page } from '@playwright/test'

const defaultEmail = 'e2e-test@wraglet.local'

export async function loginAsE2EUser(page: Page) {
  const email = (process.env.E2E_TEST_USER_EMAIL ?? defaultEmail).toLowerCase()
  const password = process.env.E2E_TEST_USER_PASSWORD
  if (!password) {
    throw new Error('E2E_TEST_USER_PASSWORD is required for loginAsE2EUser')
  }

  await page.goto('/')
  await page.getByLabel('Email or Username').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL('/feed', { timeout: 20_000 })
  await expect(page.getByRole('banner')).toBeVisible()
}
