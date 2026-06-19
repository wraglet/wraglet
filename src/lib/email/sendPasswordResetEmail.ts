import { captureAuthEmailToken } from '@/lib/email/captureAuthEmailToken'
import { getAppBaseUrl } from '@/lib/email/resendClient'
import { sendResendEmail } from '@/lib/email/sendResendEmail'

export const sendPasswordResetEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`

  await captureAuthEmailToken(to, 'reset', token)

  await sendResendEmail(
    'password reset email',
    {
      to,
      subject: 'Reset your Wraglet password',
      html: `
      <p>We received a request to reset your Wraglet password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
    `,
      text: `Reset your Wraglet password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`
    },
    resetUrl
  )
}
