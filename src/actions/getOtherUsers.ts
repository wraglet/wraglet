'use server'

import getSession from '@/actions/getSession'
import type { PublicUser } from '@/interfaces'
import client from '@/lib/db'
import User from '@/models/User'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

import { DEFAULT_GENDER, DEFAULT_PRONOUN } from '@/data/constants'

const getOtherUsers = async (): Promise<PublicUser[]> => {
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
      .select(
        'firstName lastName email username gender profilePicture coverPhoto bio pronoun dob publicProfileVisible followingIds createdAt updatedAt'
      )
      .sort({ createdAt: 'desc' })
      .exec()

    // Convert each user document to a plain object and convert ObjectId to string
    const plainUsers = users.map((user) => user.toObject())
    const convertedUsers = convertObjectIdsToStrings(plainUsers) as PublicUser[]

    // Ensure all users have gender and pronoun fields
    const usersWithDefaults = convertedUsers.map((user) => ({
      ...user,
      gender: user.gender || DEFAULT_GENDER,
      pronoun: user.pronoun || DEFAULT_PRONOUN
    }))

    // Debug: Check for duplicates before filtering
    const userIds = usersWithDefaults.map((user) => user._id)
    const duplicateIds = userIds.filter(
      (id: string, index: number) => userIds.indexOf(id) !== index
    )
    if (duplicateIds.length > 0) {
      console.warn('Found duplicate user IDs in getOtherUsers:', duplicateIds)
    }

    // Remove duplicates based on _id to ensure unique users
    const uniqueUsers = usersWithDefaults.filter(
      (user, index, self) => index === self.findIndex((u) => u._id === user._id)
    )

    return uniqueUsers
  } catch (error: unknown) {
    console.error(
      'Some error happened while getting getOtherUsers(): ',
      error instanceof Error ? error.message : error
    )
    return []
  }
}

export default getOtherUsers
