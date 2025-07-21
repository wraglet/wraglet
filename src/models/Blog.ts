import { AuthorInterface } from '@/interfaces'
import { Document, model, models, Schema, Types } from 'mongoose'

// Base interface for Blog data (for UI consumption)
export interface IBlog {
  _id: string
  title: string
  summary: string
  content: string
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
  likes: number
  likedBy: string[]
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
      | 'likedBy'
      | 'createdAt'
      | 'updatedAt'
      | 'publishedAt'
    >,
    Document {
  author: Types.ObjectId | AuthorInterface
  reactions: Types.ObjectId[] | any[]
  comments: Types.ObjectId[] | any[]
  likedBy: Types.ObjectId[]
  publishedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

const BlogSchema = new Schema<IBlogDocument>(
  {
    title: { type: String, required: true, maxlength: 200 },
    summary: { type: String, required: true, maxlength: 500 },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
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
      ]
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
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reactions: [{ type: Schema.Types.ObjectId, ref: 'PostReaction' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    publishedAt: Date
  },
  { timestamps: true }
)

// Create slug from title before saving
BlogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Add timestamp if slug already exists
    const timestamp = Date.now()
    this.slug = `${this.slug}-${timestamp}`
  }

  // Calculate read time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length
    this.readTime = Math.max(1, Math.ceil(wordCount / 200))
  }

  // Set publishedAt when status changes to published
  if (
    this.isModified('status') &&
    this.status === 'published' &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date()
  }

  next()
})

// Index for better performance
BlogSchema.index({ author: 1, createdAt: -1 })
BlogSchema.index({ status: 1, publishedAt: -1 })
BlogSchema.index({ category: 1 })
BlogSchema.index({ tags: 1 })
// Note: slug index is automatically created by unique: true constraint

const Blog = models?.Blog || model<IBlogDocument>('Blog', BlogSchema)

export default Blog
