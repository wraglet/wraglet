'use server'

import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Post from '@/models/Post'
import User from '@/models/User'
import { Types } from 'mongoose'

// Type definition for the lean user object
type UserLean = {
  _id: Types.ObjectId | string
  [key: string]: any
}

// Return document-like objects that will be deJSONified by the client
const getPostsByUsername = async (username: string) => {
  try {
    // Connect to the database
    await client()

    // Ensure models are registered
    initModels()

    // Find the user by username with proper typing
    const user = (await User.findOne({ username }).lean()) as UserLean | null
    if (!user) {
      return [] // Return an empty array if the user is not found
    }

    // Query posts with populated fields
    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'author',
        select: 'firstName lastName username gender pronoun profilePicture'
      })
      .populate({
        path: 'reactions',
        populate: {
          path: 'userId',
          select: 'firstName lastName username profilePicture'
        }
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'firstName lastName username gender pronoun profilePicture'
        }
      })
      .lean()

    // Return the queried posts - they will be automatically serialized to JSON
    // when crossing the server/client boundary
    return posts
  } catch (error) {
    console.error('Error getting posts by username:', error)
    return [] // Return an empty array on error
  }
}

export default getPostsByUsername
