import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import User from '@/models/User'
import { z } from 'zod'

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  suffix: z.string().optional(),
  username: z.string().min(1).optional(),
  dob: z.coerce.date().optional(),
  gender: z.string().optional(),
  bio: z.string().max(300).optional(),
  pronoun: z.string().optional(),
  publicProfileVisible: z.boolean().optional()
  // address: z.string().optional(), // Uncomment if address is in the model
})

export const PATCH = async (req: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = updateUserSchema.parse(body)

    // Only allow updating own profile
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: validated },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}

export const GET = async (req: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Exclude current user
    const users = await User.find({ _id: { $ne: currentUser._id } })
      .select('firstName lastName username profilePicture')
      .lean()
    return NextResponse.json({ success: true, users })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
