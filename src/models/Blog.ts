import { AuthorInterface } from '@/interfaces'
import { blogDocumentPreSave } from '@/models/blogDocumentPreSave'
import { Document, model, models, Schema, Types } from 'mongoose'

export const BLOG_CATEGORIES = [
  'Technology',
  'Design',
  'Business',
  'Lifestyle',
  'Health',
  'Travel',
  'Food',
  'Fashion',
  'Sports',
  'Entertainment',
  'Science',
  'Education',
  'Other'
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

// Base interface for Blog data (for UI consumption)
export interface IBlog {
  _id: string
  title: string
  summary: string
  contentBlocks: {
    id: string
    type: 'text' | 'code' | 'image' | 'video'
    content?: string
    order: number
    metadata?: {
      language?: string // for code blocks
      caption?: string // for images/videos
      url?: string // for images/videos
      alt?: string // for images
      key?: string // for R2 storage key
    }
  }[]
  category: string
  tags: string[]
  coverImage?: {
    url: string
    key: string
  }
  status: 'draft' | 'published' | 'archived'
  author: AuthorInterface
  slug: string
  readTime: number // estimated read time in minutes
  views: number
  /** Denormalized count of PostReaction docs (all types); kept in sync by API. */
  likes: number
  /** User ids with a legacy row before PostReaction migration; usually empty. */
  reactedBy?: string[]
  comments: {
    _id: string
    content: string
    author: AuthorInterface
    blog: string
    createdAt?: string
    updatedAt?: string
  }[]
  reactions: {
    userId: {
      _id: string
    }
    type: string
  }[]
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
  __v?: number
}

// Document interface with Mongoose types (for database operations)
export interface IBlogDocument
  extends Omit<
      IBlog,
      | '_id'
      | 'author'
      | 'reactions'
      | 'comments'
      | 'reactedBy'
      | 'createdAt'
      | 'updatedAt'
      | 'publishedAt'
    >,
    Document {
  author: Types.ObjectId | AuthorInterface
  reactions: Types.ObjectId[]
  comments: Types.ObjectId[]
  reactedBy: Types.ObjectId[]
  publishedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

const BlogSchema = new Schema<IBlogDocument>(
  {
    title: { type: String, required: true, maxlength: 200 },
    summary: { type: String, required: true, maxlength: 500 },
    contentBlocks: {
      type: [
        {
          id: { type: String, required: true },
          type: {
            type: String,
            required: true,
            enum: ['text', 'code', 'image', 'video']
          },
          content: { type: String, default: '' },
          order: { type: Number, required: true },
          metadata: {
            language: String,
            caption: String,
            url: String,
            alt: String,
            key: String
          }
        }
      ],
      required: true,
      validate: {
        validator: function (blocks: IBlog['contentBlocks']) {
          return blocks && blocks.length > 0
        },
        message: 'At least one content block is required'
      }
    },
    category: {
      type: String,
      required: true,
      enum: [...BLOG_CATEGORIES]
    },
    tags: [{ type: String, maxlength: 50 }],
    coverImage: {
      url: String,
      key: String
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, required: true, unique: true },
    readTime: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    reactedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reactions: [{ type: Schema.Types.ObjectId, ref: 'PostReaction' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'BlogComment' }],
    publishedAt: Date
  },
  { timestamps: true }
)

// Slug is set by API routes (stable URLs); do not rewrite on title change here.

BlogSchema.pre('save', blogDocumentPreSave)

// Index for better performance
BlogSchema.index({ author: 1, createdAt: -1 })
BlogSchema.index({ status: 1, publishedAt: -1 })
BlogSchema.index({ category: 1 })
BlogSchema.index({ tags: 1 })
// Note: slug index is automatically created by unique: true constraint

const Blog = models?.Blog || model<IBlogDocument>('Blog', BlogSchema)

export default Blog
