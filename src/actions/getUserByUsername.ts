'use server'

import getSession from '@/actions/getSession'
import client from '@/lib/db'
import User from '@/models/User'
import mongoose from 'mongoose'

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

      // Convert main _id to string
      if (userObject._id instanceof mongoose.Types.ObjectId) {
        userObject._id = userObject._id.toString()
      }

      // Convert ObjectIds in photoCollection
      if (userObject.photoCollection) {
        userObject.photoCollection = userObject.photoCollection.map(
          (photo: any) => {
            const photoObj = { ...photo }
            if (photoObj._id instanceof mongoose.Types.ObjectId) {
              photoObj._id = photoObj._id.toString()
            }
            return photoObj
          }
        )
      }

      // Convert ObjectIds in profilePicture
      if (userObject.profilePicture) {
        const profilePictureObj = { ...userObject.profilePicture }
        if (profilePictureObj._id instanceof mongoose.Types.ObjectId) {
          profilePictureObj._id = profilePictureObj._id.toString()
        }
        userObject.profilePicture = profilePictureObj
      }

      return { ...userObject, isCurrentUser }
    }

    return null // Return null if the user is not found
  } catch (error) {
    console.error('Error while getting user by username: ', error)
    return null // Return null on error
  }
}

export default getUserByUsername
