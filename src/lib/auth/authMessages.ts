/**
 * Generic auth feedback — same copy whether or not the email exists (anti-enumeration).
 * Future tense: the UI always shows this message even when nothing was sent.
 */
export const AUTH_FEEDBACK = {
  forgotPassword:
    "If an account exists for that email, you'll receive password reset instructions shortly.",
  resendVerification:
    "If an account exists for that email and still needs verification, you'll receive a new link shortly."
} as const

export type AuthFeedbackKey = keyof typeof AUTH_FEEDBACK

export const FORGOT_PASSWORD_GENERIC_MESSAGE = AUTH_FEEDBACK.forgotPassword
export const RESEND_VERIFICATION_GENERIC_MESSAGE =
  AUTH_FEEDBACK.resendVerification
