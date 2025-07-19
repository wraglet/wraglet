import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import Follow from '@/models/Follow'
import Post from '@/models/Post'

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  try {
    await client()
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's following list
    const following = await Follow.find({ followerId: currentUser._id })
      .select('followingId')
      .lean()
    const followingIds = following.map((f) => f.followingId)

    // Get recent activities from followed users
    const activities = []

    // Recent posts from followed users
    const recentPosts = await Post.find({
      author: { $in: followingIds },
      createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) } // Last 24 hours
    })
      .populate('author', 'firstName lastName username profilePicture gender')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    for (const post of recentPosts) {
      activities.push({
        type: 'post',
        user: post.author,
        action: 'posted a new update',
        timestamp: post.createdAt,
        data: {
          postId: post._id,
          content: post.content.substring(0, 50) + '...'
        }
      })
    }

    // Recent follows (who followed whom)
    const recentFollows = await Follow.find({
      followerId: { $in: followingIds },
      createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) }
    })
      .populate(
        'followerId',
        'firstName lastName username profilePicture gender'
      )
      .populate(
        'followingId',
        'firstName lastName username profilePicture gender'
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    for (const follow of recentFollows) {
      activities.push({
        type: 'follow',
        user: follow.followerId,
        action: `started following ${follow.followingId.firstName} ${follow.followingId.lastName}`,
        timestamp: follow.createdAt,
        data: { followedUser: follow.followingId }
      })
    }

    // Sort all activities by timestamp
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      success: true,
      activities: activities.slice(0, limit)
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
