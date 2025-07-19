'use server'

import getSession from '@/actions/getSession'
import client from '@/lib/db'
import User from '@/models/User'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

const getOtherUsers = async () => {
  const session = await getSession().catch((err) => {
    console.error(
      'Error happened while getting getSession on getOtherUsers: ',
      err
    )
  })

  if (!session?.user?.email) {
    return []
  }

  try {
    await client()

    const users = await User.find({
      email: { $ne: session.user.email }
    })
      .select('-hashedPassword')
      .sort({ createdAt: 'desc' })
      .exec()

    // Convert each user document to a plain object and convert ObjectId to string
    const plainUsers = users.map((user) => user.toObject())
    const convertedUsers = convertObjectIdsToStrings(plainUsers)

    // Debug: Check for duplicates before filtering
    const userIds = convertedUsers.map((user: any) => user._id)
    const duplicateIds = userIds.filter(
      (id: string, index: number) => userIds.indexOf(id) !== index
    )
    if (duplicateIds.length > 0) {
      console.warn('Found duplicate user IDs in getOtherUsers:', duplicateIds)
    }

    // Remove duplicates based on _id to ensure unique users
    const uniqueUsers = convertedUsers.filter(
      (user: any, index: number, self: any[]) =>
        index === self.findIndex((u: any) => u._id === user._id)
    )

    return uniqueUsers
  } catch (error: any) {
    console.error('Some error happened while getting getOtherUsers(): ', error)
    return []
  }
}

export default getOtherUsers
