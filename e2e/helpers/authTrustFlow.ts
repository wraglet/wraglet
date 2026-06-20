import type { APIRequestContext } from '@playwright/test'

export const getTrustFlowPassword = (): string => {
  const password = process.env.E2E_TEST_USER_PASSWORD
  if (!password) {
    throw new Error(
      'E2E_TEST_USER_PASSWORD is required for auth trust flow tests'
    )
  }
  return password
}

/** Post-reset password derived from env (avoids a second hard-coded test secret). */
export const getTrustFlowResetPassword = (): string => {
  const password = getTrustFlowPassword()
  return password.endsWith('!') ? `${password.slice(0, -1)}2!` : `${password}2!`
}

export const uniqueTrustEmail = (): string =>
  `e2e-trust-${Date.now()}@wraglet.local`

export const registerTrustUser = async (
  request: APIRequestContext,
  email: string,
  password = getTrustFlowPassword()
) => {
  const res = await request.post('/api/register', {
    data: {
      firstName: 'Maria',
      lastName: 'Garcia',
      email,
      password,
      dob: '1995-06-01',
      gender: 'Female',
      pronoun: 'She/Her',
      publicProfileVisible: true,
      turnstileToken: 'test',
      website: ''
    }
  })

  return res
}

export const fetchCapturedAuthToken = async (
  request: APIRequestContext,
  email: string,
  kind: 'verify' | 'reset'
): Promise<string> => {
  const res = await request.get(
    `/api/e2e/auth-token?email=${encodeURIComponent(email)}&kind=${kind}`
  )
  if (!res.ok()) {
    throw new Error(
      `Failed to read ${kind} token for ${email}: ${res.status()}`
    )
  }
  const json = (await res.json()) as { token?: string }
  if (!json.token) {
    throw new Error(`Missing ${kind} token for ${email}`)
  }
  return json.token
}

export const credentialsCheck = async (
  request: APIRequestContext,
  email: string,
  password: string
): Promise<boolean> => {
  const res = await request.post('/api/auth/credentials-check', {
    data: { emailOrUsername: email, password }
  })
  const json = (await res.json()) as { ok?: boolean }
  return json.ok === true
}
