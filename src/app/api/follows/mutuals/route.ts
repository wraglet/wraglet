import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import Follow from '@/models/Follow'

export const GET = async () => {
  try {
    const currentUser = await getCurrentUser()
    const currentUserId = currentUser?._id?.toString()
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await client()

    const following = await Follow.find({ followerId: currentUserId })
      .select('followingId')
      .lean()
    const followingIds = following.map((f) => f.followingId)

    if (followingIds.length === 0) {
      return NextResponse.json({ mutualIds: [] })
    }

    const mutualFollows = await Follow.find({
      followerId: { $in: followingIds },
      followingId: currentUserId
    })
      .select('followerId')
      .lean()

    const mutualIds = mutualFollows.map((f) => f.followerId.toString())

    return NextResponse.json({ mutualIds })
  } catch (error) {
    console.error('GET /api/follows/mutuals error:', error)
    return NextResponse.json({ mutualIds: [] }, { status: 500 })
  }
}
