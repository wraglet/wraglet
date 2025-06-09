'use server'

import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Post from '@/models/Post'
import Share from '@/models/Share'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

const getPostById = async (id: string) => {
  try {
    await client()
    await initModels()

    // First try to find it as a regular post
    let post = await Post.findById(id)
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

    if (post) {
      // Convert ObjectIds to strings
      return convertObjectIdsToStrings(post)
    }

    // If not found as a post, try to find it as a share
    const share = await Share.findById(id)
      .populate([
        {
          path: 'sharedBy',
          select: 'firstName lastName username gender pronoun profilePicture'
        },
        {
          path: 'originalPost',
          populate: {
            path: 'author',
            select: 'firstName lastName username gender pronoun profilePicture'
          }
        },
        {
          path: 'comments',
          populate: {
            path: 'author',
            select: 'firstName lastName username gender pronoun profilePicture'
          }
        },
        {
          path: 'reactions',
          populate: {
            path: 'userId',
            select: 'firstName lastName username profilePicture'
          }
        }
      ])
      .lean()

    if (share) {
      // Convert ObjectIds to strings and add a type indicator
      return convertObjectIdsToStrings({ ...share, type: 'share' })
    }

    return null
  } catch (error: any) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default getPostById
