/**
 * Request hardening shared by the moderation Workers.
 * Pure functions (no bindings) so they can be unit-tested from the app's Vitest setup.
 */

const QUARANTINE_PREFIX = 'quarantine/'

const encoder = new TextEncoder()

/** Constant-time string comparison (Workers runtime exposes `crypto.subtle.timingSafeEqual`). */
export const timingSafeEqualString = (a: string, b: string): boolean => {
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  if (aBytes.byteLength !== bBytes.byteLength) {
    return false
  }
  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (x: ArrayBufferView, y: ArrayBufferView) => boolean
  }
  if (typeof subtle.timingSafeEqual === 'function') {
    return subtle.timingSafeEqual(aBytes, bBytes)
  }
  // Fallback for runtimes without the non-standard API (tests): still constant-time per byte.
  let diff = 0
  for (let i = 0; i < aBytes.byteLength; i += 1) {
    diff |= aBytes[i] ^ bBytes[i]
  }
  return diff === 0
}

/** Validates `Authorization: Bearer <secret>` without leaking timing information. */
export const isBearerAuthorized = (
  header: string | null,
  secret: string | undefined
): boolean => {
  if (!secret || !header) {
    return false
  }
  return timingSafeEqualString(header, `Bearer ${secret}`)
}

/**
 * Only objects under `quarantine/` may be read or promoted by the Workers.
 * Rejects traversal-looking keys even though R2 keys are flat.
 */
export const isQuarantineKey = (key: unknown): key is string =>
  typeof key === 'string' &&
  key.length > QUARANTINE_PREFIX.length &&
  key.length <= 1024 &&
  key.startsWith(QUARANTINE_PREFIX) &&
  !key.includes('..') &&
  !key.includes('//') &&
  !key.includes('\\')

/** Mongo ObjectId as used by the app for post ids. */
export const isObjectIdString = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{24}$/i.test(value)

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

/**
 * The callback URL comes from the app's request body; make sure the Worker can only be
 * pointed back at the app (prevents using the Worker as an authenticated SSRF relay).
 *
 * - `https:` required, except plain `http:` to localhost for local development.
 * - When `allowedHosts` (comma-separated) is configured, the hostname must match exactly.
 */
export const isAllowedCallbackUrl = (
  raw: unknown,
  allowedHosts: string | undefined
): raw is string => {
  if (typeof raw !== 'string' || raw.length > 2048) {
    return false
  }

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }

  const hostname = url.hostname.toLowerCase()
  const isLocal = LOCAL_HOSTS.has(hostname)

  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocal)) {
    return false
  }
  if (url.username || url.password) {
    return false
  }

  const allowlist = (allowedHosts ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)

  if (allowlist.length === 0) {
    return true
  }
  return allowlist.includes(hostname)
}
