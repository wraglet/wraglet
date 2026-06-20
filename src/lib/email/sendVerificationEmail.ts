import { captureAuthEmailToken } from '@/lib/email/captureAuthEmailToken'
import { getAppBaseUrl } from '@/lib/email/resendClient'
import { sendResendEmail } from '@/lib/email/sendResendEmail'

export const sendVerificationEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const verifyUrl = `${getAppBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`

  await captureAuthEmailToken(to, 'verify', token)

  await sendResendEmail(
    'verification email',
    {
      to,
      subject: 'Verify your Wraglet email',
      html: `
      <p>Thanks for signing up for Wraglet.</p>
      <p><a href="${verifyUrl}">Verify your email</a></p>
      <p>Or copy this link: ${verifyUrl}</p>
      <p>If you did not create an account, you can ignore this email.</p>
    `,
      text: `Verify your Wraglet email: ${verifyUrl}\n\nIf you did not create an account, ignore this email.`
    },
    verifyUrl
  )
}
