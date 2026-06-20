import { NextResponse } from 'next/server'
import { needsEmailVerification } from '@/lib/auth/accountAccess'
import { AUTH_FEEDBACK } from '@/lib/auth/authMessages'
import { enrollUserForEmailVerification } from '@/lib/auth/enrollEmailVerification'
import { findUserByEmail } from '@/lib/auth/findUserByEmail'
import { getClientIp } from '@/lib/auth/getClientIp'
import client from '@/lib/db'
import { checkRateLimit } from '@/lib/trust/rateLimit'
import { normalizeEmailInput } from '@/lib/trust/validateEmail'

const GENERIC_MESSAGE = AUTH_FEEDBACK.resendVerification

export const POST = async (request: Request) => {
  try {
    await client()

    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: GENERIC_MESSAGE })
    }

    const normalized = normalizeEmailInput(email)

    const ip = getClientIp(request)

    const ipLimit = await checkRateLimit(
      `verify-resend:ip:${ip ?? 'unknown'}`,

      10,

      60 * 60 * 1000
    )

    if (!ipLimit.allowed) {
      return NextResponse.json({ message: GENERIC_MESSAGE })
    }

    const user = await findUserByEmail(normalized)

    if (user && needsEmailVerification(user)) {
      const emailLimit = await checkRateLimit(
        `verify-resend:email:${normalized}`,

        3,

        60 * 60 * 1000
      )

      if (!emailLimit.allowed) {
        return NextResponse.json({ message: GENERIC_MESSAGE })
      }

      await enrollUserForEmailVerification(user)
    }

    return NextResponse.json({ message: GENERIC_MESSAGE })
  } catch (error) {
    console.error('POST /api/auth/resend-verification:', error)

    return NextResponse.json({ message: GENERIC_MESSAGE })
  }
}
