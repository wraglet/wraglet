type TurnstileVerifyResponse = {
  success: boolean
  'error-codes'?: string[]
}

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export const isTurnstileConfigured = (): boolean =>
  Boolean(process.env.TURNSTILE_SECRET_KEY)

/** Skip verification in automated tests and Playwright E2E (dev server). */
export const shouldSkipTurnstile = (): boolean => {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
    return true
  }

  if (process.env.NODE_ENV === 'production') {
    return false
  }

  return (
    process.env.E2E_SKIP_TURNSTILE === 'true' ||
    process.env.E2E_SKIP_TURNSTILE === '1' ||
    process.env.E2E_CAPTURE_AUTH_TOKENS === 'true' ||
    process.env.E2E_CAPTURE_AUTH_TOKENS === '1'
  )
}

const allowDevWithoutTurnstile = (): boolean =>
  process.env.NODE_ENV !== 'production' && !isTurnstileConfigured()

export const verifyTurnstileToken = async (
  token: string | undefined | null,
  remoteIp?: string | null
): Promise<boolean> => {
  if (shouldSkipTurnstile()) return true

  if (!isTurnstileConfigured()) {
    if (allowDevWithoutTurnstile()) return true
    console.error('[turnstile] TURNSTILE_SECRET_KEY is required in production')
    return false
  }

  if (!token) return false

  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return false

  const body = new URLSearchParams({
    secret,
    response: token
  })
  if (remoteIp) body.set('remoteip', remoteIp)

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    const data = (await res.json()) as TurnstileVerifyResponse
    if (!data.success) {
      console.warn('[turnstile] verification failed', data['error-codes'])
    }
    return data.success === true
  } catch (error) {
    console.error('[turnstile] siteverify request failed', error)
    return false
  }
}
