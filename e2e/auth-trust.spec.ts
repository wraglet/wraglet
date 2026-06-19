import { expect, test } from '@playwright/test'

import { AUTH_FEEDBACK } from '../src/lib/auth/authMessages'

test('/forgot-password shows reset form', async ({ page }) => {
  await page.goto('/forgot-password')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Forgot password' })
  ).toBeVisible()
  await expect(page.getByPlaceholder('Email')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Send reset link' })
  ).toBeVisible()
})

test('/verify-email shows check-your-inbox message', async ({ page }) => {
  await page.goto('/verify-email?email=test%40example.com')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Check your email' })
  ).toBeVisible()
  await expect(page.getByText('test@example.com')).toBeVisible()
})

test('/reset-password without token shows invalid link message', async ({
  page
}) => {
  await page.goto('/reset-password')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Invalid reset link' })
  ).toBeVisible()
})

test('POST /api/auth/forgot-password returns generic message for unknown email', async ({
  request
}) => {
  const res = await request.post('/api/auth/forgot-password', {
    data: {
      email: 'nobody@example.com',
      turnstileToken: 'test'
    }
  })

  if (res.status() === 400) {
    test.skip(
      true,
      'Dev server lacks E2E_SKIP_TURNSTILE — forgot-password API is covered by Vitest.'
    )
  }

  expect(res.status()).toBe(200)
  const json = await res.json()
  expect(json.message).toBe(AUTH_FEEDBACK.forgotPassword)
})

test('POST /api/auth/resend-verification returns generic message', async ({
  request
}) => {
  const res = await request.post('/api/auth/resend-verification', {
    data: { email: 'unknown@example.com' }
  })
  expect(res.status()).toBe(200)
  const json = await res.json()
  expect(json.message).toBe(AUTH_FEEDBACK.resendVerification)
})

test('login shows verified toast after email verification redirect', async ({
  page
}) => {
  await page.goto('/?verified=1')
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Email verified. You can sign in now.' })
  ).toBeVisible()
  await expect(page).toHaveURL('/')
})

test('login shows error toast for invalid verify link redirect', async ({
  page
}) => {
  await page.goto('/?error=invalid_verify_link')
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'This verification link is invalid or has expired.' })
  ).toBeVisible()
  await expect(page).toHaveURL('/')
})
