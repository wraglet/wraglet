'use server'

import { AuthorInterface, PostVoteInterface } from '@/interfaces'
import { PostReactionDocument } from '@/models/PostReaction'
import mongoose, { Document, Schema } from 'mongoose'

export interface PostDocument extends Document {
  createdAt: any
  content: {
    text?: string
    images?: {
      url: string
      key: string
    }[]
  }
  audience: string
  author: AuthorInterface
  reactions: PostReactionDocument[]
  votes: PostVoteInterface[]
}

const PostSchema = new Schema<PostDocument>(
  {
    content: {
      text: String,
      images: [{ url: String, key: String }]
    },
    audience: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PostReaction' }],
    votes: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        voteType: { type: String, enum: ['upvote', 'downvote'] },
        createdAt: Date,
        updatedAt: Date
      }
    ]
  },
  { timestamps: true }
)

const Post =
  (mongoose.models.Post as mongoose.Model<PostDocument>) ||
  mongoose.model<PostDocument>('Post', PostSchema)

export default Post
