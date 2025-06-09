import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { createFollowNotification } from '@/lib/notifications'
import Follow from '@/models/Follow'
import { Types } from 'mongoose'

// Helper to get current user ID using getCurrentUser action
const getCurrentUserId = async (): Promise<string | null> => {
  const currentUser = await getCurrentUser()
  return currentUser?._id?.toString() || null
}

export const GET = async (request: Request) => {
  try {
    const currentUserId = await getCurrentUserId()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || !Types.ObjectId.isValid(userId)) {
      // Default: return current user's followingIds
      if (!currentUserId) {
        return NextResponse.json({ followingIds: [] }, { status: 401 })
      }
      const follows = await Follow.find({ followerId: currentUserId })
      const followingIds = follows.map((f) => f.followingId.toString())
      return NextResponse.json({ followingIds })
    }

    // Fetch followers and following counts for the given userId
    const followersCount = await Follow.countDocuments({ followingId: userId })
    const followingCount = await Follow.countDocuments({ followerId: userId })
    let isFollowing = false
    if (currentUserId) {
      isFollowing = !!(await Follow.findOne({
        followerId: currentUserId,
        followingId: userId
      }))
    }
    return NextResponse.json({ followersCount, followingCount, isFollowing })
  } catch (error) {
    return NextResponse.json(
      { followersCount: 0, followingCount: 0, isFollowing: false },
      { status: 500 }
    )
  }
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

    // Create follow notification
    try {
      await createFollowNotification(currentUserId, targetUserId)
    } catch (error) {
      console.error('Error creating follow notification:', error)
    }

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
