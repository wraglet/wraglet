import { normalizeEmailInput } from '@/lib/trust/validateEmail'
import E2EAuthToken, { type AuthEmailTokenKind } from '@/models/E2EAuthToken'

export type { AuthEmailTokenKind }

export const isAuthTokenCaptureEnabled = (): boolean =>
  (process.env.E2E_CAPTURE_AUTH_TOKENS === 'true' ||
    process.env.E2E_CAPTURE_AUTH_TOKENS === '1') &&
  process.env.NODE_ENV !== 'production' &&
  process.env.VERCEL_ENV !== 'production'

/** Store raw auth tokens for Playwright when Resend is unavailable. */
export const captureAuthEmailToken = async (
  email: string,
  kind: AuthEmailTokenKind,
  token: string
): Promise<void> => {
  if (!isAuthTokenCaptureEnabled()) return

  const normalized = normalizeEmailInput(email)
  await E2EAuthToken.findOneAndUpdate(
    { email: normalized, kind },
    { token, createdAt: new Date() },
    { upsert: true }
  )
}

export const readCapturedAuthEmailToken = async (
  email: string,
  kind: AuthEmailTokenKind
): Promise<string | null> => {
  if (!isAuthTokenCaptureEnabled()) return null

  const doc = await E2EAuthToken.findOne({
    email: normalizeEmailInput(email),
    kind
  }).lean<{ token: string } | null>()

  return doc?.token ?? null
}
