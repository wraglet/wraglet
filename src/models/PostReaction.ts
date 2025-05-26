import { AuthorInterface } from '@/interfaces'
import { Document, model, models, Schema, Types } from 'mongoose'

// Base interface for PostReaction data (for UI consumption)
export interface IPostReaction {
  _id: string
  type: string
  postId: string
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
      '_id' | 'postId' | 'userId' | 'createdAt' | 'updatedAt'
    >,
    Document {
  postId: Types.ObjectId
  userId: Types.ObjectId | AuthorInterface
  createdAt?: Date
  updatedAt?: Date
}

const PostReactionSchema = new Schema<IPostReactionDocument>(
  {
    type: String,
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
)

const PostReaction =
  models?.PostReaction ||
  model<IPostReactionDocument>('PostReaction', PostReactionSchema)

export default PostReaction
