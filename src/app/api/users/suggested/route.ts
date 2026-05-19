import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import { getTrendingUsersWithFollowerCounts } from '@/lib/users/getTrendingUsersWithFollowerCounts'
import User from '@/models/User'
import { Types } from 'mongoose'

export const GET = async (_req: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    let trendingUsers: Awaited<
      ReturnType<typeof getTrendingUsersWithFollowerCounts>
    > = []
    try {
      trendingUsers = await getTrendingUsersWithFollowerCounts(currentUser._id)
    } catch {
      trendingUsers = []
    }
    // Random users (excluding current and trending)
    const trendingIds = trendingUsers.map((u) => String(u._id))
    const randomUsers = await User.aggregate([
      {
        $match: {
          _id: {
            $ne: currentUser._id,
            $nin: trendingIds.length
              ? trendingIds.map((id: string) => new Types.ObjectId(id))
              : []
          }
        }
      },
      { $sample: { size: 10 } },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          username: 1,
          profilePicture: 1,
          gender: 1
        }
      }
    ])
    // Filter out current user from trendingUsers as well
    const filteredTrending = trendingUsers.filter(
      (u) => String(u._id) !== String(currentUser._id)
    )
    // Combine and shuffle
    const combined = [...filteredTrending, ...randomUsers]
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[combined[i], combined[j]] = [combined[j], combined[i]]
    }
    return NextResponse.json({ success: true, users: combined.slice(0, 12) })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch suggested users' },
      { status: 500 }
    )
  }
}
