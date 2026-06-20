import { generateAuthToken, hashAuthToken } from '@/lib/auth/tokens'
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail'
import type { IUserDocument } from '@/models/User'

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000

/** Enroll (or re-enroll) an unverified user and send a fresh verification link. */
export const enrollUserForEmailVerification = async (
  user: IUserDocument
): Promise<void> => {
  const token = generateAuthToken()
  user.accountStatus = 'pending_verification'
  user.emailVerificationTokenHash = hashAuthToken(token)
  user.emailVerificationExpiresAt = new Date(Date.now() + VERIFY_TTL_MS)
  await user.save()
  await sendVerificationEmail(user.email, token)
}
