import { expect, test } from '@playwright/test'

import { E2E_SEED_BLOG_SLUG } from './fixtures/seed-constants'
import { loginAsE2EUser } from './helpers/auth'

test.describe('authenticated UI flows', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !process.env.E2E_TEST_USER_PASSWORD,
      'Set E2E_TEST_USER_PASSWORD and run seed for flow tests'
    )
    await loginAsE2EUser(page)
  })

  test('feed shows composer', async ({ page }) => {
    await page.goto('/feed')
    const composer = page.getByPlaceholder(
      "How's your day? Share a thought, a picture—or both."
    )
    await expect(composer).toBeVisible({ timeout: 20_000 })
    await expect(
      page
        .locator('form')
        .filter({ has: composer })
        .getByRole('button', { name: 'Post', exact: true })
    ).toBeVisible()
  })

  test('settings sidebar navigates to Account', async ({ page }) => {
    await page.goto('/settings/profile')
    await page
      .getByRole('navigation', { name: 'Settings categories' })
      .getByRole('link', { name: 'Account' })
      .click()
    await expect(page).toHaveURL('/settings/account')
    await expect(
      page.getByRole('heading', { name: 'Account Settings' })
    ).toBeVisible()
  })

  test('header search debounce then open full search', async ({ page }) => {
    await page.goto('/feed')
    const input = page.getByPlaceholder('Search Wraglet...')
    await expect(input).toBeVisible()
    await input.fill('E2E')
    // SearchBar debounces API calls for 3s
    await expect(page.getByText(/Search for "E2E"/)).toBeVisible({
      timeout: 10_000
    })
    await page.getByText(/Search for "E2E"/).click()
    await expect(page).toHaveURL(/\/search\?q=E2E/)
  })

  test('blog page author link goes to profile', async ({ page }) => {
    await page.goto(`/blog/${E2E_SEED_BLOG_SLUG}`)
    await expect(
      page.getByRole('heading', { level: 1, name: /E2E Welcome Blog/i })
    ).toBeVisible({ timeout: 20_000 })
    await page
      .getByRole('link', { name: /E2E Test/i })
      .first()
      .click()
    await expect(page).toHaveURL(/\/@/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'E2E Test' })
    ).toBeVisible({ timeout: 15_000 })
  })

  test('mobile bottom nav opens settings', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/feed')
    const bottomNav = page
      .locator('nav')
      .filter({ has: page.getByRole('link', { name: 'Videos' }) })
    await expect(bottomNav).toBeVisible({ timeout: 15_000 })
    await bottomNav.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL('/settings/profile')
    // Mobile settings layout uses category label ("Profile"); desktop page has "Profile Settings".
    await expect(
      page.getByRole('heading', { level: 1, name: 'Profile' })
    ).toBeVisible({ timeout: 15_000 })
  })
})
