'use server'

import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Post from '@/models/Post'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

const getPostById = async (id: string) => {
  try {
    await client()
    await initModels()

    const post = await Post.findById(id)
      .populate([
        {
          path: 'author',
          select:
            'firstName lastName username gender pronoun profilePicture coverPhoto'
        },
        {
          path: 'comments',
          populate: {
            path: 'author',
            select: 'firstName lastName username gender pronoun profilePicture'
          }
        },
        {
          path: 'reactions.userId',
          select: 'firstName lastName username profilePicture'
        }
      ])
      .lean()

    if (!post) {
      return null
    }

    // Convert ObjectIds to strings
    return convertObjectIdsToStrings(post)
  } catch (error: any) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default getPostById
