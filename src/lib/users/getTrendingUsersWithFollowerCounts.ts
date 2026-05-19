import type { TrendingUser } from '@/contracts/usersApi'
import Follow from '@/models/Follow'
import User from '@/models/User'

export type TrendingUserWithFollowerCount = TrendingUser
/**
 * Same dataset as `GET /api/users/trending` — used by suggested users to avoid internal HTTP.
 */
export const getTrendingUsersWithFollowerCounts = async (
  excludeUserId: string | { toString(): string }
): Promise<TrendingUserWithFollowerCount[]> => {
  const excludeId = String(excludeUserId)
  const topFollowed = await Follow.aggregate([
    { $group: { _id: '$followingId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ])
  const userIds = topFollowed.map((f) => f._id)
  const users = await User.find({
    _id: { $in: userIds, $ne: excludeId }
  })
    .select('firstName lastName username profilePicture gender')
    .lean()

  return users.map(
    (u): TrendingUserWithFollowerCount => ({
      _id: String(u._id),
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      profilePicture: u.profilePicture ?? null,
      gender: u.gender,
      followerCount:
        topFollowed.find((f) => String(f._id) === String(u._id))?.count ?? 0
    })
  )
}
