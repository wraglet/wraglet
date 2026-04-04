import { AuthorInterface } from '@/interfaces'
import { Document, model, models, Schema, Types } from 'mongoose'

// Base interface for PostReaction data (for UI consumption)
export interface IPostReaction {
  _id: string
  type: string
  /** Set when reaction targets a post (or share — shares reuse postId in API). */
  postId?: string
  /** Set when reaction targets a blog. */
  blogId?: string
  userId: {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
    profilePicture?: {
      url: string
    }
  }
  createdAt?: string
  updatedAt?: string
}

// Document interface with Mongoose types (for database operations)
export interface IPostReactionDocument
  extends Omit<
      IPostReaction,
      '_id' | 'postId' | 'blogId' | 'userId' | 'createdAt' | 'updatedAt'
    >,
    Document {
  postId?: Types.ObjectId
  blogId?: Types.ObjectId
  userId: Types.ObjectId | AuthorInterface
  createdAt?: Date
  updatedAt?: Date
}

const PostReactionSchema = new Schema<IPostReactionDocument>(
  {
    type: String,
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
)

PostReactionSchema.pre('validate', function (next) {
  const hasPost = !!this.postId
  const hasBlog = !!this.blogId
  if (hasPost === hasBlog) {
    next(
      new Error('PostReaction requires exactly one of postId or blogId')
    )
    return
  }
  next()
})

PostReactionSchema.index(
  { blogId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: { blogId: { $exists: true, $type: 'objectId' } }
  }
)

const PostReaction =
  models?.PostReaction ||
  model<IPostReactionDocument>('PostReaction', PostReactionSchema)

export default PostReaction
