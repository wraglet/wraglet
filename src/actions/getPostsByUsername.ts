import Post, { PostDocument } from '@/models/Post'
import User from '@/models/User'
import mongoose from 'mongoose'

const getPostsByUsername = async (
  username: string
): Promise<PostDocument[]> => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI!)

    // Find the user by username
    const user = await User.findOne({ username })
    if (!user) {
      return [] // Return an empty array if the user is not found
    }

    // Fetch posts authored by the user with audience 'public'
    const userPosts = await Post.find({
      author: user._id,
      audience: 'public'
    })
      .sort({ createdAt: 'desc' }) // Sort posts by creation date
      .populate({
        path: 'author',
        select:
          'firstName lastName username gender pronoun profilePicture coverPhoto'
      })
      .exec()

    return userPosts // Return the fetched posts
  } catch (error) {
    console.error(`Error at getPostsByUsername(${username}): `, error)
    return [] // Return an empty array on error
  }
}

export default getPostsByUsername
