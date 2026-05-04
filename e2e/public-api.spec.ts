import { expect, test } from '@playwright/test'

/** API routes that do not require a session; use isolated `request` fixture. */
test('GET /api/search works without auth', async ({ request }) => {
  const res = await request.get('/api/search?q=test')
  expect(res.ok(), await res.text()).toBeTruthy()
  const data = await res.json()
  expect(data.success).toBe(true)
  expect(Array.isArray(data.results)).toBe(true)
})

test('GET /api/users/topics-trending works without auth', async ({
  request
}) => {
  const res = await request.get('/api/users/topics-trending')
  expect(res.ok(), await res.text()).toBeTruthy()
  const data = await res.json()
  expect(data.success).toBe(true)
  expect(Array.isArray(data.topics)).toBe(true)
})

test('GET /api/token without auth returns 401', async ({ request }) => {
  const res = await request.get('/api/token')
  expect(res.status()).toBe(401)
})
