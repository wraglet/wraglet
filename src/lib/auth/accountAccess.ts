import type { AccountStatus } from '@/models/User'

/** Minimal user fields for sign-in / reset eligibility checks. */
export type AccountAccessUser = {
  accountStatus?: AccountStatus | null
  emailVerifiedAt?: Date | null
}

export const isEmailVerified = (user: AccountAccessUser): boolean =>
  Boolean(user.emailVerifiedAt)

/**
 * Who may sign in with email + password.
 * Every account must have a verified email (legacy users included).
 */
export const canUserSignIn = (user: AccountAccessUser): boolean => {
  const status = user.accountStatus
  if (status === 'suspended' || status === 'deleted') return false
  if (status === 'pending_verification') return false
  if (!user.emailVerifiedAt) return false
  return true
}

/**
 * Who may receive a forgot-password email.
 * Includes pending_verification: the reset link proves inbox ownership and
 * successful reset also marks the email verified.
 */
export const canRequestPasswordReset = (user: AccountAccessUser): boolean => {
  const status = user.accountStatus
  if (status === 'suspended' || status === 'deleted') return false
  return true
}

/**
 * Who still needs the /verify-email flow (login path sends a fresh link).
 */
export const needsEmailVerification = (user: AccountAccessUser): boolean =>
  !isEmailVerified(user) &&
  user.accountStatus !== 'suspended' &&
  user.accountStatus !== 'deleted'
