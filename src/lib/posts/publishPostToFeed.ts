import { getAblyInstance } from '@/lib/ably'
import Post from '@/models/Post'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

export const POST_AUTHOR_SELECT =
  'firstName lastName username gender pronoun profilePicture'

/** Populates a post the same way the feed does (author, reactions, comments). */
export const findPopulatedPost = async (postId: string) =>
  Post.findById(postId)
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

/**
 * Pushes a (now feed-visible) post to the realtime `post-channel`.
 * Never throws: realtime is best-effort and must not fail the calling request.
 * Returns the populated post so callers can reuse it in their response.
 */
export const publishPostToFeed = async (postId: string) => {
  const populatedPost = await findPopulatedPost(postId)
  if (!populatedPost) {
    return null
  }
  const payload = convertObjectIdsToStrings(populatedPost)
  try {
    const ably = getAblyInstance()
    await ably.channels.get('post-channel').publish('post', payload)
  } catch (error) {
    console.warn('Failed to publish post to Ably:', error)
  }
  return payload
}
