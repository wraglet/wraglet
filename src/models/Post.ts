import { AuthorInterface, PostVoteInterface } from '@/interfaces'
import type { ModerationStatus } from '@/lib/moderation/statusMap'
import { Document, model, models, Schema, Types } from 'mongoose'

export type ModerationRejectedReason =
  | 'duration'
  | 'explicit'
  | 'gore'
  | 'minor'
  | 'format'
  | 'quota'

// Base interface for Post data (for UI consumption)
export interface IPost {
  _id: string
  content: {
    text?: string
    images?: {
      url: string
      key: string
    }[]
    video?: {
      url: string
      key: string
      posterUrl?: string
      posterKey?: string
      durationSec: number
      width: number
      height: number
    }
    blogPreview?: {
      url: string
      slug: string
      title: string
      summary?: string
      category?: string
      /** null when no cover is set for the blog */
      coverImage?: string | null
    }
  }
  audience: string
  author: AuthorInterface
  moderationStatus?: ModerationStatus
  moderationMeta?: {
    imageScores?: Record<string, number>
    /** Frame-classification scores for a video post. Kept separate from `imageScores`. */
    videoScores?: Record<string, number>
    videoFrameCount?: number
    pendingImageKey?: string
    pendingVideoKey?: string
    rawBytes?: number
    reviewedAt?: Date
    rejectedReason?: ModerationRejectedReason
    /** Last error while handing off to / processing in the Cloudflare Workers. */
    pipelineError?: string
  }
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
  shareCount?: number
  createdAt?: string
  updatedAt?: string
  __v?: number // Mongoose version key
}

// Document interface with Mongoose types (for database operations)
export interface IPostDocument
  extends Omit<
      IPost,
      | '_id'
      | 'author'
      | 'reactions'
      | 'comments'
      | 'createdAt'
      | 'updatedAt'
      | 'moderationMeta'
    >,
    Document {
  author: Types.ObjectId | AuthorInterface
  reactions: Types.ObjectId[]
  comments: Types.ObjectId[]
  moderationMeta?: IPost['moderationMeta']
  createdAt?: Date
  updatedAt?: Date
}

const PostSchema = new Schema<IPostDocument>(
  {
    content: {
      text: String,
      images: [{ url: String, key: String }],
      video: {
        url: String,
        key: String,
        posterUrl: String,
        posterKey: String,
        durationSec: Number,
        width: Number,
        height: Number
      },
      blogPreview: {
        url: { type: String },
        slug: { type: String },
        title: { type: String },
        summary: { type: String, required: false },
        category: { type: String, required: false },
        coverImage: { type: String, required: false }
      }
    },
    audience: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_review'],
      default: 'approved'
    },
    moderationMeta: {
      imageScores: { type: Map, of: Number },
      videoScores: { type: Map, of: Number },
      videoFrameCount: Number,
      pendingImageKey: String,
      pendingVideoKey: String,
      rawBytes: Number,
      reviewedAt: Date,
      rejectedReason: {
        type: String,
        enum: ['duration', 'explicit', 'gore', 'minor', 'format', 'quota']
      },
      pipelineError: String
    },
    reactions: [{ type: Schema.Types.ObjectId, ref: 'PostReaction' }],
    votes: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        voteType: { type: String, enum: ['upvote', 'downvote'] },
        createdAt: Date,
        updatedAt: Date
      }
    ],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    shareCount: { type: Number, default: 0 }
  },
  { timestamps: true }
)

const Post = models?.Post || model<IPostDocument>('Post', PostSchema)

export default Post
