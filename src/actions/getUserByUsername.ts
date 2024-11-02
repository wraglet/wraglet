import getSession from '@/actions/getSession'
import User from '@/models/User'
import mongoose from 'mongoose'

const getUserByUsername = async (username: string) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)

    const session = await getSession()

    // Check if the session has a valid user email
    if (!session?.user?.email) {
      return null // Return null if no email is found
    }

    // Find the user by username, excluding the hashed password
    const user = await User.findOne({
      username: username
    }).select('-hashedPassword')

    // Check if the found user is the current user
    const isCurrentUser = user && user.email === session?.user?.email

    // Return the user object with isCurrentUser property
    return user ? { ...user.toObject(), isCurrentUser } : null
  } catch (error) {
    console.error('Error while getting user by username: ', error)
    return null // Return null on error
  }
}

export default getUserByUsername
