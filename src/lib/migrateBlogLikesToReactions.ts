import Blog from '@/models/Blog'
import PostReaction from '@/models/PostReaction'
import type { Types } from 'mongoose'

let didCheckLikedByRename = false

/**
 * Renames MongoDB field `likedBy` → `reactedBy` on all blogs (one-time per process).
 * Skips documents that already have `reactedBy` so $rename does not conflict.
 */
export const ensureBlogLikedByRenamedToReactedBy = async (): Promise<void> => {
  if (didCheckLikedByRename) return
  try {
    const coll = Blog.collection
    const legacy = await coll.findOne(
      { likedBy: { $exists: true }, reactedBy: { $exists: false } },
      { projection: { _id: 1 } }
    )
    if (!legacy) {
      didCheckLikedByRename = true
      return
    }

    const result = await coll.updateMany(
      { likedBy: { $exists: true }, reactedBy: { $exists: false } },
      { $rename: { likedBy: 'reactedBy' } }
    )
    if (result.modifiedCount > 0) {
      console.log(
        '[Blog] Renamed likedBy → reactedBy:',
        result.modifiedCount,
        'documents'
      )
    }
    didCheckLikedByRename = true
  } catch (error) {
    console.error('[Blog] likedBy → reactedBy rename failed:', error)
  }
}

/**
 * Migrates legacy blog.reactedBy (or pre-rename likedBy, after ensure rename) → PostReaction on blog.reactions.
 * Safe to call multiple times (no-op if reactions already exist).
 */
export const migrateLegacyBlogLikesToReactions = async (
  blogId: Types.ObjectId
): Promise<void> => {
  await ensureBlogLikedByRenamedToReactedBy()

  const blog = await Blog.findById(blogId)
    .select('reactions reactedBy likes')
    .lean()

  if (!blog) return

  const existing = (blog as { reactions?: Types.ObjectId[] }).reactions ?? []
  if (existing.length > 0) return

  const rawReactedBy =
    (blog as { reactedBy?: Types.ObjectId[] }).reactedBy ?? []
  const seen = new Set<string>()
  const reactedBy = rawReactedBy.filter((id) => {
    const s = id.toString()
    if (seen.has(s)) return false
    seen.add(s)
    return true
  })
  if (reactedBy.length === 0) return

  const newIds: Types.ObjectId[] = []
  for (const userId of reactedBy) {
    const doc = await PostReaction.create({
      blogId: blogId,
      userId,
      type: 'like'
    })
    newIds.push(doc._id)
  }

  await Blog.findByIdAndUpdate(blogId, {
    $push: { reactions: { $each: newIds } },
    $set: {
      likes: newIds.length,
      reactedBy: []
    }
  })
}
