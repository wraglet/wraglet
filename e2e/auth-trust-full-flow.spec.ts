import { expect, test } from '@playwright/test'

import {
  credentialsCheck,
  fetchCapturedAuthToken,
  getTrustFlowPassword,
  getTrustFlowResetPassword,
  registerTrustUser,
  uniqueTrustEmail
} from './helpers/authTrustFlow'

test('signup → verify → login → forgot → reset → login with new password', async ({
  request
}) => {
  test.skip(
    !process.env.MONGODB_URI || !process.env.E2E_TEST_USER_PASSWORD,
    'MONGODB_URI and E2E_TEST_USER_PASSWORD required for auth trust flow E2E'
  )

  const email = uniqueTrustEmail()
  const initialPassword = getTrustFlowPassword()
  const newPassword = getTrustFlowResetPassword()

  const registerRes = await registerTrustUser(request, email, initialPassword)
  expect(registerRes.status()).toBe(200)

  const verifyToken = await fetchCapturedAuthToken(request, email, 'verify')
  const verifyRes = await request.get(
    `/api/auth/verify-email?token=${encodeURIComponent(verifyToken)}`,
    { maxRedirects: 0 }
  )
  expect(verifyRes.status()).toBe(307)
  expect(verifyRes.headers()['location']).toContain('verified=1')

  expect(await credentialsCheck(request, email, initialPassword)).toBe(true)

  const forgotRes = await request.post('/api/auth/forgot-password', {
    data: { email, turnstileToken: 'test' }
  })
  expect(forgotRes.status()).toBe(200)

  const resetToken = await fetchCapturedAuthToken(request, email, 'reset')
  const resetRes = await request.post('/api/auth/reset-password', {
    data: { token: resetToken, password: newPassword }
  })
  expect(resetRes.status()).toBe(200)

  expect(await credentialsCheck(request, email, initialPassword)).toBe(false)
  expect(await credentialsCheck(request, email, newPassword)).toBe(true)
})
