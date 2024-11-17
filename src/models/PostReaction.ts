'use server'

import { AuthorInterface } from '@/interfaces'
import mongoose, { Document, Schema } from 'mongoose'

export interface PostReactionDocument extends Document {
  type: string
  postId: mongoose.Types.ObjectId
  userId: AuthorInterface
}

const PostReactionSchema = new Schema<PostReactionDocument>(
  {
    type: String,
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
)

const PostReaction =
  mongoose.models.PostReaction ||
  mongoose.model<PostReactionDocument>('PostReaction', PostReactionSchema)

export default PostReaction
