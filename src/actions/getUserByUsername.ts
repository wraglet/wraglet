'use server'

import getSession from '@/actions/getSession'
import client from '@/lib/db'
import User from '@/models/User'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

import { DEFAULT_GENDER, DEFAULT_PRONOUN } from '@/data/constants'

const getUserByUsername = async (username: string) => {
  try {
    await client()

    const session = await getSession()

    // Check if the session has a valid user email
    if (!session?.user?.email) {
      console.log('No valid email in session')
      return null // Return null if no email is found
    }

    // Find the user by username, excluding the hashed password
    const user = await User.findOne({
      username: username
    }).select(
      'firstName lastName email username gender profilePicture coverPhoto bio pronoun dob publicProfileVisible followingIds createdAt updatedAt'
    )

    // Check if the found user is the current user
    const isCurrentUser = user?.email === session?.user?.email

    // Convert the user document to a plain object and handle ObjectId
    if (user) {
      const userObject = user.toObject()
      // Convert all ObjectIds to strings recursively
      const convertedUser = convertObjectIdsToStrings({
        ...userObject,
        isCurrentUser
      })

      // Ensure gender field is always present
      if (!convertedUser.gender) {
        convertedUser.gender = DEFAULT_GENDER
      }

      // Ensure pronoun field is always present
      if (!convertedUser.pronoun) {
        convertedUser.pronoun = DEFAULT_PRONOUN
      }

      return convertedUser
    }

    return null // Return null if the user is not found
  } catch (error) {
    console.error('Error while getting user by username: ', error)
    return null // Return null on error
  }
}

export default getUserByUsername
