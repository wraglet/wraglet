'use server'

import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Post from '@/models/Post'
import Share from '@/models/Share'
import User from '@/models/User'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
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

    // Query regular posts with populated fields
    const postsPromise = Post.find({ author: user._id })
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

    // Query shares made by this user
    const sharesPromise = Share.find({ sharedBy: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'sharedBy',
        select: 'firstName lastName username profilePicture'
      })
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'firstName lastName username profilePicture'
        }
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
          select: 'firstName lastName username profilePicture'
        }
      })
      .lean()

    // Execute both queries in parallel
    const [posts, shares] = await Promise.all([postsPromise, sharesPromise])

    // Combine and sort by creation time
    const allContent = [
      ...posts.map((post) => ({
        type: 'post',
        data: post,
        createdAt: post.createdAt
      })),
      ...shares.map((share) => ({
        type: 'share',
        data: share,
        createdAt: share.createdAt
      }))
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Return the queried posts and shares - they will be automatically serialized to JSON
    // when crossing the server/client boundary
    return convertObjectIdsToStrings(allContent)
  } catch (error) {
    console.error('Error getting posts by username:', error)
    return [] // Return an empty array on error
  }
}

export default getPostsByUsername
