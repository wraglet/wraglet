import { expect, test } from '@playwright/test'

test('home links to register from body CTA', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('link', { name: /Don'?t have an account\?/i })
    .click()
  await expect(page).toHaveURL('/register')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Create an account' })
  ).toBeVisible()
})

test('header Sign up on home goes to register', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Sign up', exact: true }).click()
  await expect(page).toHaveURL('/register')
})

test('header Login on register goes home', async ({ page }) => {
  await page.goto('/register')
  await page.getByRole('link', { name: 'Login', exact: true }).click()
  await expect(page).toHaveURL('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Welcome Back!' })
  ).toBeVisible()
})

test('footer Help link from home opens help', async ({ page }) => {
  await page.goto('/')
  await page
    .locator('main footer')
    .getByRole('link', { name: 'Help' })
    .click()
  await expect(page).toHaveURL('/help')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Help' })
  ).toBeVisible()
})

test('footer Changelog link from home opens changelog', async ({ page }) => {
  await page.goto('/')
  await page
    .locator('main footer')
    .getByRole('link', { name: 'Changelog' })
    .click()
  await expect(page).toHaveURL('/changelog')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Wraglet Changelog' })
  ).toBeVisible()
})
