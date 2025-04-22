import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import Follow from '@/models/Follow'
import { Types } from 'mongoose'

// Helper to get current user ID using getCurrentUser action
const getCurrentUserId = async (): Promise<string | null> => {
  const currentUser = await getCurrentUser()
  return currentUser?._id?.toString() || null
}

export const POST = async (request: Request) => {
  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { targetUserId } = await request.json()
    if (!targetUserId || !Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid target user' },
        { status: 400 }
      )
    }
    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }
    // Check if already following
    const existing = await Follow.findOne({
      followerId: currentUserId,
      followingId: targetUserId
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Already following' },
        { status: 409 }
      )
    }
    await Follow.create({
      followerId: currentUserId,
      followingId: targetUserId
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to follow user' },
      { status: 500 }
    )
  }
}

export const DELETE = async (request: Request) => {
  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { targetUserId } = await request.json()
    if (!targetUserId || !Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid target user' },
        { status: 400 }
      )
    }
    await Follow.deleteOne({
      followerId: currentUserId,
      followingId: targetUserId
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to unfollow user' },
      { status: 500 }
    )
  }
}
