import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import Follow from '@/models/Follow'
import Post from '@/models/Post'
import User from '@/models/User'

export const GET = async (req: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get users the current user is already following
    const following = await Follow.find({ followerId: currentUser._id })
    const followingIds = following.map((f) => f.followingId)

    // 1. Trending users (most followed)
    const trendingUsers = await Follow.aggregate([
      { $group: { _id: '$followingId', followerCount: { $sum: 1 } } },
      { $sort: { followerCount: -1 } },
      { $limit: 5 }
    ])

    // 2. Recent active users (users who posted recently)
    const recentActiveUsers = await Post.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      { $group: { _id: '$userId' } },
      { $limit: 5 }
    ])

    // 3. New users (recently joined)
    const newUsers = await User.find({
      _id: { $ne: currentUser._id, $nin: followingIds }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName username profilePicture createdAt gender')
      .lean()

    // Combine all user IDs
    const allUserIds = [
      ...trendingUsers.map((u) => u._id),
      ...recentActiveUsers.map((u) => u._id),
      ...newUsers.map((u) => u._id)
    ].filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates

    // Fetch user details
    const users = await User.find({
      _id: {
        $in: allUserIds,
        $ne: currentUser._id,
        $nin: followingIds
      }
    })
      .select('firstName lastName username profilePicture createdAt gender')
      .lean()

    // Add metadata to users
    const usersWithMetadata = users.map((user) => {
      const isTrending = trendingUsers.some(
        (t) => String(t._id) === String(user._id)
      )
      const isRecentActive = recentActiveUsers.some(
        (r) => String(r._id) === String(user._id)
      )
      const isNew = newUsers.some((n) => String(n._id) === String(user._id))

      // Calculate score for ranking
      let score = 0
      if (isTrending) score += 10
      if (isRecentActive) score += 5
      if (isNew) score += 3

      // Bonus for users with profile pictures
      if (user.profilePicture?.url) score += 2

      return {
        ...user,
        score,
        isTrending,
        isRecentActive,
        isNew
      }
    })

    // Sort by score and return top 8
    const sortedUsers = usersWithMetadata
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    return NextResponse.json({
      success: true,
      users: sortedUsers
    })
  } catch (error: any) {
    console.error('Discover users error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch discover users' },
      { status: 500 }
    )
  }
}
