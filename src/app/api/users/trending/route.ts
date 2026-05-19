import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import { getTrendingUsersWithFollowerCounts } from '@/lib/users/getTrendingUsersWithFollowerCounts'

export const GET = async (_req: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const usersWithCount = await getTrendingUsersWithFollowerCounts(
      currentUser._id
    )
    return NextResponse.json({ success: true, users: usersWithCount })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending users' },
      { status: 500 }
    )
  }
}
