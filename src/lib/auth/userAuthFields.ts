import type { IUserDocument } from '@/models/User'

/** Remove one-time email verification token fields after verify or auto-verify. */
export const clearEmailVerificationTokens = (user: IUserDocument): void => {
  user.emailVerificationTokenHash = undefined
  user.emailVerificationExpiresAt = undefined
}

/** Remove password-reset token fields after a successful reset. */
export const clearPasswordResetTokens = (user: IUserDocument): void => {
  user.passwordResetTokenHash = undefined
  user.passwordResetExpiresAt = undefined
  user.passwordResetRequestedAt = undefined
}

/** Mark inbox confirmed and activate the account; clears pending verify tokens. */
export const markEmailVerified = (user: IUserDocument): void => {
  user.emailVerifiedAt = user.emailVerifiedAt ?? new Date()
  user.accountStatus = 'active'
  clearEmailVerificationTokens(user)
}

/** Bump when password changes so older JWTs are rejected. */
export const touchPasswordChangedAt = (user: IUserDocument): void => {
  user.passwordChangedAt = new Date()
}
