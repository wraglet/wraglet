import {
  getEmailFrom,
  getResendClient,
  isEmailSendingEnabled
} from '@/lib/email/resendClient'

type ResendSendPayload = {
  to: string
  subject: string
  html: string
  text: string
}

type ResendSendError = {
  message?: string
  name?: string
}

const isResendRecipientRestriction = (message: string): boolean =>
  message.includes('only send testing emails to your own email address') ||
  message.includes('verify a domain at resend.com/domains')

export const logResendSendFailure = (
  context: string,
  error: ResendSendError,
  devFallbackUrl?: string
): void => {
  const message = error.message ?? 'Unknown Resend error'

  if (isResendRecipientRestriction(message)) {
    console.error(
      `[email] ${context}: Resend can only deliver to your Resend account email until wraglet.com is verified. ` +
        'Add and verify the domain at https://resend.com/domains and use EMAIL_FROM on that domain.',
      error
    )
  } else {
    console.error(`[email] ${context}:`, error)
  }

  if (devFallbackUrl && process.env.NODE_ENV !== 'production') {
    console.info(`[email] Dev fallback link (${context}):`, devFallbackUrl)
  }
}

export const sendResendEmail = async (
  context: string,
  payload: ResendSendPayload,
  devFallbackUrl?: string
): Promise<void> => {
  if (!isEmailSendingEnabled()) {
    console.info(`[email] ${context} (RESEND_API_KEY not set):`, devFallbackUrl)
    return
  }

  const resend = getResendClient()
  if (!resend) return

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text
  })

  if (error) {
    logResendSendFailure(context, error, devFallbackUrl)
    throw new Error(`Failed to send ${context}`)
  }
}
