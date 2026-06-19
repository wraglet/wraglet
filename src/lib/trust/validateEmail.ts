import { z } from 'zod'

type DisposableGlobal = typeof globalThis & {
  __wragletDisposableDomains?: Set<string>
}

const ROLE_LOCAL_PARTS = new Set([
  'admin',
  'noreply',
  'no-reply',
  'postmaster',
  'hostmaster',
  'abuse',
  'security'
])

/** Lazy singleton — avoids reloading ~120k domains on every dev HMR reload. */
const getDisposableDomainSet = (): Set<string> => {
  const g = globalThis as DisposableGlobal
  if (g.__wragletDisposableDomains) {
    return g.__wragletDisposableDomains
  }

  // Lazy require: ~120k domain JSON; load once per Node process via globalThis cache.
  const disposableDomains = require('disposable-email-domains') as string[]
  g.__wragletDisposableDomains = new Set(
    disposableDomains.map((d) => d.toLowerCase())
  )
  return g.__wragletDisposableDomains
}

export const emailSchema = z.string().email('Invalid email address')

export const normalizeEmailInput = (email: string): string =>
  email.trim().toLowerCase()

/**
 * Canonical form for uniqueness (Gmail/googlemail: strip dots and +tags).
 */
export const canonicalizeEmail = (email: string): string => {
  const normalized = normalizeEmailInput(email)
  const at = normalized.lastIndexOf('@')
  if (at <= 0) return normalized

  let local = normalized.slice(0, at)
  let domain = normalized.slice(at + 1)

  if (domain === 'googlemail.com') domain = 'gmail.com'

  if (domain === 'gmail.com') {
    const plus = local.indexOf('+')
    if (plus >= 0) local = local.slice(0, plus)
    local = local.replaceAll('.', '')
  }

  return `${local}@${domain}`
}

export const getEmailDomain = (email: string): string => {
  const at = email.lastIndexOf('@')
  return at >= 0 ? email.slice(at + 1) : ''
}

export const isDisposableEmailDomain = (domain: string): boolean =>
  getDisposableDomainSet().has(domain.toLowerCase())

export const gmailDotCount = (email: string): number => {
  const normalized = normalizeEmailInput(email)
  const domain = getEmailDomain(normalized)
  if (domain !== 'gmail.com' && domain !== 'googlemail.com') return 0
  const local = normalized.split('@')[0] ?? ''
  const base = local.split('+')[0] ?? local
  return (base.match(/\./g) ?? []).length
}

export type EmailValidationResult =
  | { valid: true; email: string; canonicalEmail: string }
  | { valid: false; reason: string }

export const validateSignupEmail = (
  rawEmail: string
): EmailValidationResult => {
  const parsed = emailSchema.safeParse(rawEmail.trim())
  if (!parsed.success) {
    return { valid: false, reason: 'Invalid email address' }
  }

  const email = normalizeEmailInput(parsed.data)
  const domain = getEmailDomain(email)
  const local = email.split('@')[0] ?? ''

  if (isDisposableEmailDomain(domain)) {
    return { valid: false, reason: 'This email provider is not allowed' }
  }

  if (ROLE_LOCAL_PARTS.has(local)) {
    return { valid: false, reason: 'This email address is not allowed' }
  }

  return { valid: true, email, canonicalEmail: canonicalizeEmail(email) }
}

/** @internal — test isolation */
export const _clearDisposableDomainCacheForTests = (): void => {
  const g = globalThis as DisposableGlobal
  delete g.__wragletDisposableDomains
}
