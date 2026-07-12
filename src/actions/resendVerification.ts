'use server'

import { headers } from 'next/headers'
import { needsEmailVerification } from '@/lib/auth/accountAccess'
import { AUTH_FEEDBACK } from '@/lib/auth/authMessages'
import { enrollUserForEmailVerification } from '@/lib/auth/enrollEmailVerification'
import { findUserByEmail } from '@/lib/auth/findUserByEmail'
import client from '@/lib/db'
import { checkRateLimit } from '@/lib/trust/rateLimit'
import { normalizeEmailInput } from '@/lib/trust/validateEmail'

export type ResendVerificationState = {
  error?: string
  success?: boolean
  message?: string
}

const getClientIpFromHeaders = async (): Promise<string | undefined> => {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')

  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  return headerList.get('x-real-ip') ?? undefined
}

export const resendVerificationAction = async (
  _previousState: ResendVerificationState,
  formData: FormData
): Promise<ResendVerificationState> => {
  const email = formData.get('email')

  if (typeof email !== 'string' || email.trim().length === 0) {
    return { error: 'Email is required.' }
  }

  const genericSuccess = {
    success: true,
    message: AUTH_FEEDBACK.resendVerification
  } as const

  try {
    await client()
    const normalized = normalizeEmailInput(email)
    const ip = await getClientIpFromHeaders()

    const ipLimit = await checkRateLimit(
      `verify-resend:ip:${ip ?? 'unknown'}`,
      10,
      60 * 60 * 1000
    )

    if (!ipLimit.allowed) {
      return genericSuccess
    }

    const user = await findUserByEmail(normalized)

    if (user && needsEmailVerification(user)) {
      const emailLimit = await checkRateLimit(
        `verify-resend:email:${normalized}`,
        3,
        60 * 60 * 1000
      )

      if (!emailLimit.allowed) {
        return genericSuccess
      }

      await enrollUserForEmailVerification(user)
    }

    return genericSuccess
  } catch {
    return genericSuccess
  }
}
