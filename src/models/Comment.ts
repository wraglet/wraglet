import { Document, model, models, Schema, Types } from 'mongoose'

// Base interface for Comment data (for UI consumption)
export interface IComment {
  _id: string
  content: string
  author: {
    _id: string
    firstName: string
    lastName: string
    username: string
    gender: string
    pronoun: string
    profilePicture?: {
      url: string
      key: string
    }
  }
  post: string
  createdAt?: string
  updatedAt?: string
}

// Document interface with Mongoose types (for database operations)
export interface ICommentDocument
  extends Omit<IComment, '_id' | 'author' | 'post' | 'createdAt' | 'updatedAt'>,
    Document {
  author: Types.ObjectId
  post: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const CommentSchema = new Schema<ICommentDocument>(
  {
    content: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
  },
  { timestamps: true }
)

const Comment =
  models?.Comment || model<ICommentDocument>('Comment', CommentSchema)

export default Comment
