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
    // Aggregate follower counts
    const topFollowed = await Follow.aggregate([
      { $group: { _id: '$followingId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
    const userIds = topFollowed.map((f) => f._id)
    const users = await User.find({
      _id: { $in: userIds, $ne: currentUser._id }
    })
      .select('firstName lastName username profilePicture')
      .lean()
    // Attach follower count
    const usersWithCount = users.map((u) => ({
      ...u,
      followerCount:
        topFollowed.find((f) => String(f._id) === String(u._id))?.count || 0
    }))
    return NextResponse.json({ success: true, users: usersWithCount })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending users' },
      { status: 500 }
    )
  }
}
