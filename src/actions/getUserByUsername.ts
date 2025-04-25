'use server'

import getSession from '@/actions/getSession'
import client from '@/lib/db'
import User from '@/models/User'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

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
    }).select('-hashedPassword')

    // Check if the found user is the current user
    const isCurrentUser = user && user.email === session?.user?.email

    // Convert the user document to a plain object and handle ObjectId
    if (user) {
      const userObject = user.toObject()
      // Convert all ObjectIds to strings recursively
      return convertObjectIdsToStrings({ ...userObject, isCurrentUser })
    }

    return null // Return null if the user is not found
  } catch (error) {
    console.error('Error while getting user by username: ', error)
    return null // Return null on error
  }
}

export default getUserByUsername
