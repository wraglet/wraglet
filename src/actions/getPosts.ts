'use server'

import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Post from '@/models/Post'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

// Return document-like objects that will be deJSONified by the client
const getPosts = async () => {
  try {
    // Connect to the database
    await client()

    // Ensure models are registered
    initModels()

    // Query posts with populated fields
    const posts = await Post.find({})
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
    return convertObjectIdsToStrings(posts)
  } catch (error) {
    console.error('Error getting posts:', error)
    return []
  }
}

export default getPosts
