import { Gender, Pronoun } from '@/interfaces'
import { Document, model, models, Schema, Types } from 'mongoose'

// Base interface for BlogComment data (for UI consumption)
export interface IBlogComment {
  _id: string
  content: string
  author: {
    _id: string
    firstName: string
    lastName: string
    username: string
    gender: Gender
    pronoun: Pronoun
    profilePicture?: {
      url: string
      key: string
    }
  }
  blog: string
  createdAt?: string
  updatedAt?: string
}

// Document interface with Mongoose types (for database operations)
export interface IBlogCommentDocument
  extends Omit<
      IBlogComment,
      '_id' | 'author' | 'blog' | 'createdAt' | 'updatedAt'
    >,
    Document {
  author: Types.ObjectId
  blog: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const BlogCommentSchema = new Schema<IBlogCommentDocument>(
  {
    content: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true }
  },
  { timestamps: true }
)

const BlogComment =
  models?.BlogComment ||
  model<IBlogCommentDocument>('BlogComment', BlogCommentSchema)

export default BlogComment
