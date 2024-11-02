import getSession from '@/actions/getSession'
import User from '@/models/User'
import mongoose from 'mongoose'

const getCurrentUser = async () => {
  try {
    // Get the session
    const session = await getSession()

    // Check if the session has a valid user email
    if (!session?.user?.email) {
      return null // Return null if no email is found
    }

    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI!)

    // Find the user by email, excluding the hashed password
    const currentUser = await User.findOne({
      email: session.user.email
    }).select('-hashedPassword')

    // Return null if the user is not found
    return currentUser || null // Simplified return statement
  } catch (error) {
    console.error('Error while getting current user: ', error)
    return null // Return null on error
  }
}

export default getCurrentUser
