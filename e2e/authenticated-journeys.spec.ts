import { expect, test } from '@playwright/test'

import { loginAsE2EUser } from './helpers/auth'

test.describe('authenticated journeys', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !process.env.E2E_TEST_USER_PASSWORD,
      'Set E2E_TEST_USER_PASSWORD (and MONGODB_URI) to run authenticated E2E tests'
    )
    await loginAsE2EUser(page)
  })

  test('feed loads with app header', async ({ page }) => {
    await page.goto('/feed')
    await expect(page).toHaveURL('/feed')
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'wraglet', exact: true })
    ).toBeVisible()
  })

  test('root redirects to feed when signed in', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/feed')
  })

  test('settings profile shows profile heading', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/settings/profile')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Profile Settings' })
    ).toBeVisible()
  })

  test('search page shows empty state', async ({ page }) => {
    await page.goto('/search')
    await expect(
      page.getByRole('heading', { level: 2, name: 'Search Wraglet' })
    ).toBeVisible()
  })

  test('notifications page shows heading', async ({ page }) => {
    await page.goto('/notifications')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Notifications' })
    ).toBeVisible()
  })

  test('messages page shows chats panel', async ({ page }) => {
    await page.goto('/messages')
    await expect(page.getByText('Chats', { exact: true })).toBeVisible()
  })

  test('blog dashboard shows heading', async ({ page }) => {
    await page.goto('/blog/dashboard')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Blog Dashboard' })
    ).toBeVisible()
  })
})
