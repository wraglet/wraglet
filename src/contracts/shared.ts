import { z } from 'zod'

/** Matches `Gender` in `@/interfaces` and `User` schema enum. */
export const genderSchema = z.enum([
  'Female',
  'Male',
  'Others',
  'Prefer not to say'
])

/** Matches `Pronoun` in `@/interfaces` and `User` schema enum. */
export const pronounSchema = z.enum([
  'She/Her',
  'He/Him',
  'They/Them',
  'Prefer not to say'
])

export const objectIdStringSchema = z
  .string()
  .regex(/^[a-f0-9]{24}$/i, 'Expected a 24-character hex ObjectId')

export const mediaAssetSchema = z.object({
  url: z.string(),
  key: z.string()
})

/** `profilePicture` / `coverPhoto` on user documents and populated snippets. */
export const profilePictureSchema = mediaAssetSchema.nullable()

export const apiErrorBodySchema = z.object({
  error: z.string()
})

export const apiSuccessFalseSchema = z.object({
  success: z.literal(false),
  error: z.string()
})

/**
 * User fields returned by most `.populate(..., 'firstName lastName username profilePicture gender')`
 * and matching `.select(...)` calls (no `pronoun`).
 */
export const userPopulationSnippetSchema = z.object({
  _id: objectIdStringSchema,
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  gender: genderSchema,
  profilePicture: profilePictureSchema.nullish()
})

/**
 * Post/blog author and comment author where handlers include `pronoun` in `select`.
 */
export const postAuthorSchema = userPopulationSnippetSchema.extend({
  pronoun: pronounSchema
})

export const trendingUserSchema = userPopulationSnippetSchema.extend({
  followerCount: z.number().int().nonnegative()
})

export const discoverUserSchema = userPopulationSnippetSchema.extend({
  createdAt: z.union([z.string(), z.date()]),
  score: z.number(),
  isTrending: z.boolean(),
  isRecentActive: z.boolean(),
  isNew: z.boolean()
})

export const isoDateStringSchema = z.union([z.string(), z.date()])

export const postContentSchema = z.object({
  text: z.string().optional(),
  images: z.array(mediaAssetSchema).optional(),
  blogPreview: z
    .object({
      url: z.string(),
      slug: z.string(),
      title: z.string(),
      summary: z.string().optional(),
      category: z.string().optional(),
      coverImage: z.string().nullable().optional()
    })
    .optional()
})

export const postVoteSchema = z.object({
  userId: objectIdStringSchema,
  voteType: z.enum(['upvote', 'downvote']),
  createdAt: isoDateStringSchema.optional(),
  updatedAt: isoDateStringSchema.optional()
})

export const postInFeedSchema = z.object({
  _id: objectIdStringSchema,
  content: postContentSchema,
  audience: z.string(),
  author: postAuthorSchema,
  reactions: z.array(z.unknown()),
  comments: z.array(z.unknown()),
  votes: z.array(postVoteSchema).optional(),
  shareCount: z.number().optional(),
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema.optional(),
  __v: z.number().optional()
})

export const messageSchema = z.object({
  _id: objectIdStringSchema,
  conversation: objectIdStringSchema,
  sender: userPopulationSnippetSchema,
  content: z.string(),
  attachments: z.array(mediaAssetSchema).default([]),
  createdAt: isoDateStringSchema.optional(),
  updatedAt: isoDateStringSchema.optional()
})

export const conversationSchema = z.object({
  _id: objectIdStringSchema,
  participants: z.array(userPopulationSnippetSchema),
  isGroup: z.boolean(),
  name: z.string().optional(),
  lastMessage: z.union([messageSchema, z.null()]).optional(),
  unreadCount: z.number().int().nonnegative(),
  createdAt: isoDateStringSchema.optional(),
  updatedAt: isoDateStringSchema.optional(),
  lastRead: z
    .array(
      z.object({
        user: objectIdStringSchema,
        at: isoDateStringSchema
      })
    )
    .optional()
})

export const notificationTypeSchema = z.enum([
  'follow',
  'comment',
  'reaction',
  'new_post',
  'new_blog',
  'share',
  'admin',
  'system'
])

export const notificationItemSchema = z.object({
  _id: objectIdStringSchema,
  recipient: objectIdStringSchema.optional(),
  sender: userPopulationSnippetSchema.optional(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  data: z.record(z.string(), z.unknown()).optional(),
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema.optional()
})

/** `GET /api/posts/[postId]` author includes `coverPhoto`. */
export const postDetailAuthorSchema = postAuthorSchema.extend({
  coverPhoto: profilePictureSchema.nullish()
})

export const postDetailSchema = postInFeedSchema.extend({
  author: postDetailAuthorSchema
})

export const postCommentSchema = z.object({
  _id: objectIdStringSchema,
  content: z.string(),
  author: postAuthorSchema,
  post: objectIdStringSchema,
  createdAt: isoDateStringSchema.optional(),
  updatedAt: isoDateStringSchema.optional()
})

export const blogCommentSchema = z.object({
  _id: objectIdStringSchema,
  content: z.string(),
  author: postAuthorSchema,
  blog: objectIdStringSchema,
  createdAt: isoDateStringSchema.optional(),
  updatedAt: isoDateStringSchema.optional()
})

export const blogContentBlockSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['text', 'code', 'image', 'video']),
  content: z.string().optional(),
  order: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
})

export const blogStatusSchema = z.enum(['draft', 'published', 'archived'])

export const blogListItemSchema = z.object({
  _id: objectIdStringSchema,
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  status: blogStatusSchema,
  category: z.string(),
  author: postAuthorSchema,
  tags: z.array(z.string()).optional(),
  coverImage: mediaAssetSchema.optional(),
  readTime: z.number().optional(),
  views: z.number().optional(),
  likes: z.number().optional(),
  createdAt: isoDateStringSchema.optional(),
  updatedAt: isoDateStringSchema.optional()
})

export const blogCoreSchema = blogListItemSchema.extend({
  contentBlocks: z.array(blogContentBlockSchema),
  reactions: z.array(z.unknown()).optional(),
  comments: z.array(z.unknown()).optional(),
  publishedAt: isoDateStringSchema.optional(),
  __v: z.number().optional()
})

export const blogsListSuccessSchema = z.object({
  blogs: z.array(blogListItemSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean()
})

export const shareEmbeddedPostSchema = z.object({
  _id: objectIdStringSchema,
  content: postContentSchema,
  audience: z.string(),
  author: userPopulationSnippetSchema,
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema.optional()
})

export const shareDocumentSchema = z.object({
  _id: objectIdStringSchema,
  visibility: z.enum(['public', 'mutuals', 'only_me']),
  message: z.string().optional(),
  sharedBy: userPopulationSnippetSchema,
  originalPost: z.union([objectIdStringSchema, shareEmbeddedPostSchema]),
  reactions: z.array(z.unknown()),
  comments: z.array(z.unknown()),
  votes: z.array(postVoteSchema).optional(),
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema.optional()
})

export const sharesListSuccessSchema = z.object({
  shares: z.array(shareDocumentSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean()
})

export const mediaUploadSuccessSchema = z.object({
  url: z.string(),
  key: z.string()
})

/** User JSON from profile/cover/photo-collection updates (`select('-hashedPassword')`). */
export const publicUserSchema = z
  .object({
    _id: objectIdStringSchema,
    email: z.string().email(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    gender: genderSchema,
    pronoun: pronounSchema
  })
  .passthrough()

export const photoCollectionItemSchema = z.object({
  url: z.string(),
  key: z.string(),
  type: z.enum(['post', 'avatar']),
  createdAt: isoDateStringSchema
})

export const ablyTokenRequestSchema = z
  .object({
    keyName: z.string(),
    ttl: z.number(),
    capability: z.string(),
    clientId: z.string(),
    timestamp: z.number(),
    nonce: z.string(),
    mac: z.string()
  })
  .passthrough()

export const ablyTokenErrorSchema = z.object({
  errorMessage: z.string()
})

export const adminNotificationSuccessSchema = z.object({
  success: z.literal(true),
  count: z.number().int().nonnegative(),
  message: z.string()
})

export const passwordPatchSuccessSchema = z.object({
  success: z.literal(true)
})

export type UserPopulationSnippet = z.infer<typeof userPopulationSnippetSchema>
export type PostAuthorSnippet = z.infer<typeof postAuthorSchema>
export type PostInFeed = z.infer<typeof postInFeedSchema>
export type PostDetail = z.infer<typeof postDetailSchema>
export type ShareDocument = z.infer<typeof shareDocumentSchema>
