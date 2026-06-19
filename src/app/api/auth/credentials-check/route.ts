import { NextResponse } from 'next/server'
import { needsEmailVerification } from '@/lib/auth/accountAccess'
import { findUserByCredential } from '@/lib/auth/resolveCredentialUser'
import client from '@/lib/db'
import bcrypt from 'bcryptjs'

/**
 * Pre-login check: validates credentials without creating a session.
 * Unverified users are redirected to /verify-email (resend happens there).
 */
export const POST = async (request: Request) => {
  try {
    await client()
    const body = await request.json()
    const emailOrUsername =
      typeof body.emailOrUsername === 'string' ? body.emailOrUsername : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!emailOrUsername.trim() || !password) {
      return NextResponse.json({ ok: false })
    }

    const user = await findUserByCredential(emailOrUsername)

    if (!user?.hashedPassword) {
      return NextResponse.json({ ok: false })
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.hashedPassword
    )

    if (!isPasswordCorrect) {
      return NextResponse.json({ ok: false })
    }

    if (needsEmailVerification(user)) {
      return NextResponse.json({
        ok: false,
        needsVerification: true,
        email: user.email
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST /api/auth/credentials-check:', error)
    return NextResponse.json({ ok: false })
  }
}
