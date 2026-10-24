import { getAblyInstance } from '@/lib/ably'
import { isFeedVisibleStatus } from '@/lib/moderation/statusMap'
import { createNewPostNotification } from '@/lib/notifications'
import Follow from '@/models/Follow'
import Post, { type IPost } from '@/models/Post'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

export const POST_AUTHOR_SELECT =
  'firstName lastName username gender pronoun profilePicture'

/** Populates a post the same way the feed does (author, reactions, comments). */
export const findPopulatedPost = async (
  postId: string
): Promise<IPost | null> => {
  const post = await Post.findById(postId)
    .populate({ path: 'author', select: POST_AUTHOR_SELECT })
    .populate({
      path: 'reactions',
      populate: {
        path: 'userId',
        select: 'firstName lastName username profilePicture gender'
      }
    })
    .populate({
      path: 'comments',
      populate: { path: 'author', select: POST_AUTHOR_SELECT }
    })
    .lean()

  if (!post || Array.isArray(post)) {
    return null
  }
  return post as IPost
}

const authorIdOf = (author: unknown): string | undefined => {
  if (!author) {
    return undefined
  }
  if (typeof author === 'string') {
    return author
  }
  if (typeof author === 'object' && '_id' in author && author._id) {
    return String(author._id)
  }
  return undefined
}

/**
 * Pushes a feed-visible post to the realtime `post-channel` and notifies followers.
 * Used when a post becomes visible after moderation, and when a video is approved
 * without a separate create-time fan-out. Never throws.
 */
export const publishPostToFeed = async (postId: string) => {
  const populatedPost = await findPopulatedPost(postId)
  if (!populatedPost || !isFeedVisibleStatus(populatedPost.moderationStatus)) {
    return null
  }
  const payload = convertObjectIdsToStrings(populatedPost)
  try {
    const ably = getAblyInstance()
    await ably.channels.get('post-channel').publish('post', payload)
  } catch (error) {
    console.warn('Failed to publish post to Ably:', error)
  }

  const authorId = authorIdOf(populatedPost.author)
  if (!authorId) {
    return payload
  }
  try {
    const followers = await Follow.find({ followingId: authorId })
      .select('followerId')
      .lean<Array<{ followerId: { toString(): string } }>>()
    if (followers.length > 0) {
      await createNewPostNotification(
        authorId,
        followers.map((follower) => follower.followerId.toString()),
        postId
      )
    }
  } catch (error) {
    console.error('Error creating new post notifications:', error)
  }
  return payload
}
