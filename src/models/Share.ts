import { AuthorInterface } from '@/interfaces'
import { Document, model, models, Schema, Types } from 'mongoose'

// Base interface for Share data (for UI consumption)
export interface IShare {
  _id: string
  originalPost: string
  sharedBy: AuthorInterface
  visibility: 'public' | 'mutuals' | 'only_me'
  message?: string
  createdAt?: string
  updatedAt?: string
}

// Document interface with Mongoose types (for database operations)
export interface IShareDocument
  extends Omit<
      IShare,
      '_id' | 'sharedBy' | 'originalPost' | 'createdAt' | 'updatedAt'
    >,
    Document {
  originalPost: Types.ObjectId
  sharedBy: Types.ObjectId | AuthorInterface
  createdAt?: Date
  updatedAt?: Date
}

const ShareSchema = new Schema<IShareDocument>(
  {
    originalPost: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    sharedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    visibility: {
      type: String,
      enum: ['public', 'mutuals', 'only_me'],
      default: 'public'
    },
    message: { type: String, default: '' }
  },
  { timestamps: true }
)

// Ensure a user can only share a post once
ShareSchema.index({ originalPost: 1, sharedBy: 1 }, { unique: true })

const Share = models?.Share || model<IShareDocument>('Share', ShareSchema)

export default Share
