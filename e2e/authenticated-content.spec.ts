import { expect, test } from '@playwright/test'

import {
  E2E_SEED_BLOG_SLUG,
  E2E_SEED_BLOG_TITLE,
  E2E_SEED_POST_ID,
  e2eProfilePath
} from './fixtures/seed-constants'
import { loginAsE2EUser } from './helpers/auth'

const defaultUsername = '@e2e_wraglet'

test.describe('authenticated content (seeded data)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !process.env.E2E_TEST_USER_PASSWORD,
      'Set E2E_TEST_USER_PASSWORD and run seed (global setup) for these tests'
    )
    await loginAsE2EUser(page)
  })

  test('profile shows seeded user name', async ({ page }) => {
    const username = process.env.E2E_TEST_USER_USERNAME ?? defaultUsername
    await page.goto(e2eProfilePath(username))
    await expect(
      page.getByRole('heading', { level: 1, name: 'E2E Test' })
    ).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/followers/i).first()).toBeVisible()
  })

  test('post detail page loads seeded post', async ({ page }) => {
    await page.goto(`/post/${E2E_SEED_POST_ID}`)
    await expect(
      page.getByRole('link', { name: /Back to Feed/i }).first()
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      page.getByText('E2E seeded post for functional tests.', { exact: false })
    ).toBeVisible({ timeout: 15_000 })
  })

  test('blog read page loads seeded published blog', async ({ page }) => {
    await page.goto(`/blog/${E2E_SEED_BLOG_SLUG}`)
    await expect(
      page.getByRole('heading', { level: 1, name: E2E_SEED_BLOG_TITLE })
    ).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('Technology', { exact: true })).toBeVisible()
  })

  test('blog edit page loads for author', async ({ page }) => {
    await page.goto(`/blog/${E2E_SEED_BLOG_SLUG}/edit`)
    await expect(page.getByRole('heading', { name: 'Edit Blog' })).toBeVisible({
      timeout: 20_000
    })
  })

  test('search with query shows results for seeded data', async ({ page }) => {
    await page.goto('/search?q=E2E')
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Search results for "E2E"/i
      })
    ).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/results? found/i).first()).toBeVisible()
  })

  test('feed blogs tab URL loads', async ({ page }) => {
    await page.goto('/feed?tab=blogs')
    await expect(page).toHaveURL(/tab=blogs/)
    await expect(page.getByRole('banner')).toBeVisible()
  })

  test('settings account page renders', async ({ page }) => {
    await page.goto('/settings/account')
    await expect(
      page.getByRole('heading', { name: 'Account Settings' })
    ).toBeVisible()
  })

  test('settings notifications page renders', async ({ page }) => {
    await page.goto('/settings/notifications')
    await expect(page).toHaveURL('/settings/notifications')
    await expect(page.getByText('Email notifications')).toBeVisible({
      timeout: 15_000
    })
    await expect(
      page.getByRole('button', { name: 'Save Changes' })
    ).toBeVisible()
  })

  test('settings privacy page renders', async ({ page }) => {
    await page.goto('/settings/privacy')
    await expect(
      page.getByRole('heading', { name: 'Privacy & Security' })
    ).toBeVisible()
  })

  test('unknown post id shows not found', async ({ page }) => {
    await page.goto('/post/507f1f77bcf86cd799439099')
    await expect(
      page.getByRole('heading', { name: 'Post not found' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Back to Feed/i }).first()
    ).toBeVisible()
  })
})
