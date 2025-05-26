import { AuthorInterface, PostVoteInterface } from '@/interfaces'
import { Document, model, models, Schema, Types } from 'mongoose'

// Base interface for Post data (for UI consumption)
export interface IPost {
  _id: string
  content: {
    text?: string
    images?: {
      url: string
      key: string
    }[]
  }
  audience: string
  author: AuthorInterface
  reactions: {
    userId: {
      _id: string
    }
    type: string
  }[]
  votes: PostVoteInterface[]
  comments: {
    _id: string
    content: string
    author: AuthorInterface
    post: string
    createdAt?: string
    updatedAt?: string
  }[]
  createdAt?: string
  updatedAt?: string
  __v?: number // Mongoose version key
}

// Document interface with Mongoose types (for database operations)
export interface IPostDocument
  extends Omit<
      IPost,
      '_id' | 'author' | 'reactions' | 'comments' | 'createdAt' | 'updatedAt'
    >,
    Document {
  author: Types.ObjectId | AuthorInterface
  reactions: Types.ObjectId[] | any[]
  comments: Types.ObjectId[] | any[]
  createdAt?: Date
  updatedAt?: Date
}

const PostSchema = new Schema<IPostDocument>(
  {
    content: {
      text: String,
      images: [{ url: String, key: String }]
    },
    audience: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    reactions: [{ type: Schema.Types.ObjectId, ref: 'PostReaction' }],
    votes: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        voteType: { type: String, enum: ['upvote', 'downvote'] },
        createdAt: Date,
        updatedAt: Date
      }
    ],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
  },
  { timestamps: true }
)

const Post = models?.Post || model<IPostDocument>('Post', PostSchema)

export default Post
