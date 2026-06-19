import { NextResponse } from 'next/server'
import { canRequestPasswordReset } from '@/lib/auth/accountAccess'
import { AUTH_FEEDBACK } from '@/lib/auth/authMessages'
import { findUserByEmail } from '@/lib/auth/findUserByEmail'
import { getClientIp } from '@/lib/auth/getClientIp'
import { generateAuthToken, hashAuthToken } from '@/lib/auth/tokens'
import client from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail'
import { checkRateLimit } from '@/lib/trust/rateLimit'
import { normalizeEmailInput } from '@/lib/trust/validateEmail'
import { verifyTurnstileToken } from '@/lib/trust/verifyTurnstile'

const RESET_TTL_MS = 60 * 60 * 1000
const GENERIC_MESSAGE = AUTH_FEEDBACK.forgotPassword

export const POST = async (request: Request) => {
  try {
    await client()
    const body = await request.json()
    const { email, turnstileToken } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: GENERIC_MESSAGE })
    }

    const ip = getClientIp(request)
    const turnstileOk = await verifyTurnstileToken(turnstileToken, ip)
    if (!turnstileOk) {
      return NextResponse.json(
        { error: 'Security check failed. Please try again.' },
        { status: 400 }
      )
    }

    const normalized = normalizeEmailInput(email)

    const ipLimit = await checkRateLimit(
      `forgot:ip:${ip ?? 'unknown'}`,
      10,
      60 * 60 * 1000
    )
    if (!ipLimit.allowed) {
      return NextResponse.json({ message: GENERIC_MESSAGE })
    }

    const user = await findUserByEmail(normalized)

    if (user && canRequestPasswordReset(user)) {
      const emailLimit = await checkRateLimit(
        `forgot:email:${normalized}`,
        3,
        60 * 60 * 1000
      )
      if (!emailLimit.allowed) {
        return NextResponse.json({ message: GENERIC_MESSAGE })
      }

      const token = generateAuthToken()
      user.passwordResetTokenHash = hashAuthToken(token)
      user.passwordResetExpiresAt = new Date(Date.now() + RESET_TTL_MS)
      user.passwordResetRequestedAt = new Date()
      await user.save()

      try {
        await sendPasswordResetEmail(normalized, token)
      } catch (emailError) {
        user.passwordResetTokenHash = undefined
        user.passwordResetExpiresAt = undefined
        user.passwordResetRequestedAt = undefined
        await user.save()
        throw emailError
      }
    }

    return NextResponse.json({ message: GENERIC_MESSAGE })
  } catch (error) {
    console.error('POST /api/auth/forgot-password:', error)
    return NextResponse.json({ message: GENERIC_MESSAGE })
  }
}
