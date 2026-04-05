import { expect, test } from '@playwright/test'

import { E2E_SEED_BLOG_SLUG, E2E_SEED_POST_ID } from './fixtures/seed-constants'
import { loginAsE2EUser } from './helpers/auth'

/**
 * Exercises App Router API handlers with the same session cookies as the UI
 * (`page.request` inherits storage state from the logged-in page).
 */
test.describe('authenticated API routes', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !process.env.E2E_TEST_USER_PASSWORD,
      'Set E2E_TEST_USER_PASSWORD and run seed for authenticated API tests'
    )
    await loginAsE2EUser(page)
  })

  test('GET /api/search returns hits for seeded data', async ({ page }) => {
    const res = await page.request.get('/api/search?q=E2E')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.totalCount).toBeGreaterThan(0)
    expect(Array.isArray(data.results)).toBe(true)
  })

  test('GET /api/posts returns feed payload', async ({ page }) => {
    const res = await page.request.get('/api/posts?limit=10')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data.posts)).toBe(true)
    const ids = data.posts.map((p: { _id?: string }) => p._id)
    expect(ids).toContain(E2E_SEED_POST_ID)
  })

  test('GET /api/blogs lists author blogs', async ({ page }) => {
    const res = await page.request.get('/api/blogs?status=all&limit=20')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data.blogs)).toBe(true)
    const slugs = data.blogs.map((b: { slug?: string }) => b.slug)
    expect(slugs).toContain(E2E_SEED_BLOG_SLUG)
  })

  test('GET /api/blogs/[slug] returns blog JSON', async ({ page }) => {
    const res = await page.request.get(`/api/blogs/${E2E_SEED_BLOG_SLUG}`)
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(data.slug).toBe(E2E_SEED_BLOG_SLUG)
    expect(data.title).toBeTruthy()
  })

  test('GET /api/conversations returns success', async ({ page }) => {
    const res = await page.request.get('/api/conversations')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  test('GET /api/notifications returns payload', async ({ page }) => {
    const res = await page.request.get('/api/notifications?limit=5')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data.notifications)).toBe(true)
    expect(typeof data.unreadCount).toBe('number')
  })

  test('GET /api/activities returns payload', async ({ page }) => {
    const res = await page.request.get('/api/activities?limit=5')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.activities)).toBe(true)
  })

  test('GET /api/users returns user list', async ({ page }) => {
    const res = await page.request.get('/api/users')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.users)).toBe(true)
  })

  test('GET /api/users/discover returns users', async ({ page }) => {
    const res = await page.request.get('/api/users/discover')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.users)).toBe(true)
  })

  test('GET /api/users/trending returns users', async ({ page }) => {
    const res = await page.request.get('/api/users/trending')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data.users)).toBe(true)
  })

  test('GET /api/users/suggested returns users', async ({ page }) => {
    const res = await page.request.get('/api/users/suggested')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.users)).toBe(true)
  })

  test('GET /api/users/people-you-may-know returns users', async ({
    page
  }) => {
    const res = await page.request.get('/api/users/people-you-may-know')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.users)).toBe(true)
  })

  test('GET /api/follows returns followingIds', async ({ page }) => {
    const res = await page.request.get('/api/follows')
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data.followingIds)).toBe(true)
  })

  test('GET /api/token matches Ably configuration', async ({ page }) => {
    const res = await page.request.get('/api/token')
    const ablyConfigured = Boolean(process.env.ABLY_API_KEY?.trim())
    if (!ablyConfigured) {
      expect(res.status()).toBe(500)
      const data = await res.json()
      expect(String(data.errorMessage)).toMatch(/ABLY_API_KEY/i)
      return
    }
    expect(res.ok(), await res.text()).toBeTruthy()
    const data = await res.json()
    expect(data).toMatchObject({
      keyName: expect.any(String),
      mac: expect.any(String)
    })
  })
})
