import { NextResponse } from 'next/server'
import { hashAuthToken } from '@/lib/auth/tokens'
import client from '@/lib/db'
import { getAppBaseUrl } from '@/lib/email/resendClient'
import User from '@/models/User'

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const base = getAppBaseUrl()

    if (!token) {
      return NextResponse.redirect(`${base}/?error=invalid_verify_link`)
    }

    await client()

    const now = new Date()
    const updated = await User.findOneAndUpdate(
      {
        emailVerificationTokenHash: hashAuthToken(token),
        emailVerificationExpiresAt: { $gt: now },
        accountStatus: { $nin: ['suspended', 'deleted'] }
      },
      {
        $set: {
          accountStatus: 'active',
          emailVerifiedAt: now
        },
        $unset: {
          emailVerificationTokenHash: '',
          emailVerificationExpiresAt: ''
        }
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.redirect(`${base}/?error=invalid_verify_link`)
    }

    return NextResponse.redirect(`${base}/?verified=1`)
  } catch (error) {
    console.error('GET /api/auth/verify-email:', error)
    const base = getAppBaseUrl()
    return NextResponse.redirect(`${base}/?error=verify_failed`)
  }
}
