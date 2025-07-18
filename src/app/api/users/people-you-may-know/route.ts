import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import Follow from '@/models/Follow'
import User from '@/models/User'

export const GET = async (req: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Get users the current user is following
    const following = await Follow.find({ followerId: currentUser._id })
      .select('followingId')
      .lean()
    const followingIds = following.map((f) => f.followingId)
    // Get users followed by your followings (second-degree)
    const secondDegree = await Follow.find({
      followerId: { $in: followingIds }
    })
      .select('followingId')
      .lean()
    const secondDegreeIds = secondDegree.map((f) => String(f.followingId))
    // Exclude current user and already-followed users
    const excludeIds = [String(currentUser._id), ...followingIds.map(String)]
    const suggestions = await User.find({
      _id: { $in: secondDegreeIds, $nin: excludeIds }
    })
      .select('firstName lastName username profilePicture')
      .limit(10)
      .lean()
    return NextResponse.json({ success: true, users: suggestions })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch people you may know' },
      { status: 500 }
    )
  }
}
