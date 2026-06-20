import { NextResponse } from 'next/server'
import { getClientIp } from '@/lib/auth/getClientIp'
import { passwordSchema } from '@/lib/auth/passwordSchema'
import { generateAuthToken, hashAuthToken } from '@/lib/auth/tokens'
import client from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail'
import { checkRateLimit } from '@/lib/trust/rateLimit'
import { validateSignupEmail } from '@/lib/trust/validateEmail'
import { validateHumanName } from '@/lib/trust/validateHumanName'
import { verifyTurnstileToken } from '@/lib/trust/verifyTurnstile'
import { generateUsername } from '@/lib/utils'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000
const GENERIC_REGISTER_ERROR =
  'Unable to create account. Check your details and try again.'

export const POST = async (request: Request) => {
  try {
    await client()

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      dob,
      gender,
      pronoun,
      publicProfileVisible,
      turnstileToken,
      website
    } = body

    if (website) {
      return NextResponse.json(
        { error: GENERIC_REGISTER_ERROR },
        { status: 400 }
      )
    }

    if (
      !email ||
      !firstName ||
      !lastName ||
      dob == null ||
      !gender ||
      !pronoun ||
      typeof publicProfileVisible !== 'boolean' ||
      !password
    ) {
      return NextResponse.json(
        { error: GENERIC_REGISTER_ERROR },
        { status: 400 }
      )
    }

    const ip = getClientIp(request)
    const emailCheck = validateSignupEmail(email)
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: GENERIC_REGISTER_ERROR },
        { status: 400 }
      )
    }

    const turnstileOk = await verifyTurnstileToken(turnstileToken, ip)
    if (!turnstileOk) {
      return NextResponse.json(
        { error: 'Security check failed. Please try again.' },
        { status: 400 }
      )
    }

    const ipLimit = await checkRateLimit(
      `register:ip:${ip ?? 'unknown'}`,
      5,
      60 * 60 * 1000
    )
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        { status: 429 }
      )
    }

    const emailLimit = await checkRateLimit(
      `register:email:${emailCheck.canonicalEmail}`,
      3,
      24 * 60 * 60 * 1000
    )
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        { status: 429 }
      )
    }

    const nameCheck = validateHumanName(firstName, lastName)
    if (!nameCheck.valid) {
      console.info('[register] rejected name:', nameCheck.reason)
      return NextResponse.json(
        { error: GENERIC_REGISTER_ERROR },
        { status: 400 }
      )
    }

    const passwordResult = passwordSchema.safeParse(password)
    if (!passwordResult.success) {
      return NextResponse.json(
        { error: GENERIC_REGISTER_ERROR },
        { status: 400 }
      )
    }

    const existing = await User.findOne({
      $or: [
        { canonicalEmail: emailCheck.canonicalEmail },
        { email: emailCheck.email }
      ]
    })
    if (existing) {
      return NextResponse.json(
        {
          message:
            'If this email is not already registered, check your inbox to verify.'
        },
        { status: 200 }
      )
    }

    const verifyToken = generateAuthToken()
    const verifyExpires = new Date(Date.now() + VERIFY_TTL_MS)
    const hashedPassword = await bcrypt.hash(password, 12)
    const username = generateUsername(firstName, lastName)

    await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: emailCheck.email,
      canonicalEmail: emailCheck.canonicalEmail,
      username,
      hashedPassword,
      dob,
      gender,
      pronoun,
      publicProfileVisible,
      accountStatus: 'pending_verification',
      emailVerificationTokenHash: hashAuthToken(verifyToken),
      emailVerificationExpiresAt: verifyExpires
    })

    try {
      await sendVerificationEmail(emailCheck.email, verifyToken)
    } catch (emailError) {
      console.error('[register] verification email failed:', emailError)
    }

    return NextResponse.json({
      message: 'Check your email to activate your account.',
      email: emailCheck.email
    })
  } catch (error: unknown) {
    console.error('REGISTRATION ERROR: ', error)
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          message:
            'If this email is not already registered, check your inbox to verify.'
        },
        { status: 200 }
      )
    }
    console.error(
      'Some error happened while accessing POST at /api/register at route.ts: ',
      error
    )
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
