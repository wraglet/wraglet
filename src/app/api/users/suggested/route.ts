import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import User from '@/models/User'
import { Types } from 'mongoose'

export const GET = async (req: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Fetch trending users from the new API endpoint
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const trendingRes = await fetch(`${baseUrl}/api/users/trending`, {
      headers: req.headers
    })
    const trendingData = await trendingRes.json()
    const trendingUsers = trendingData.users || []
    // Random users (excluding current and trending)
    const trendingIds = trendingUsers.map((u: any) => String(u._id))
    const randomUsers = await User.aggregate([
      {
        $match: {
          _id: {
            $ne: currentUser._id,
            $nin: trendingIds.map((id: string) => new Types.ObjectId(id))
          }
        }
      },
      { $sample: { size: 10 } },
      {
        $project: { firstName: 1, lastName: 1, username: 1, profilePicture: 1 }
      }
    ])
    // Combine and shuffle
    const combined = [...trendingUsers, ...randomUsers]
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
