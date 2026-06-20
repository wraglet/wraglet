import { NextResponse } from 'next/server'
import { passwordSchema } from '@/lib/auth/passwordSchema'
import { hashAuthToken } from '@/lib/auth/tokens'
import client from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const resetSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema
})

export const POST = async (request: Request) => {
  try {
    await client()
    const body = await request.json()
    const parsed = resetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data
    const tokenHash = hashAuthToken(token)
    const now = new Date()
    const hashedPassword = await bcrypt.hash(password, 12)

    const updated = await User.findOneAndUpdate(
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: now },
        accountStatus: { $nin: ['suspended', 'deleted'] }
      },
      {
        $set: {
          hashedPassword,
          accountStatus: 'active',
          passwordChangedAt: now,
          emailVerifiedAt: now
        },
        $unset: {
          passwordResetTokenHash: '',
          passwordResetExpiresAt: '',
          passwordResetRequestedAt: '',
          emailVerificationTokenHash: '',
          emailVerificationExpiresAt: ''
        }
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired.' },
        { status: 400 }
      )
    }

    console.info('[auth] Password reset completed for user', updated._id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/auth/reset-password:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
