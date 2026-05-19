import { postInFeedSchema } from '@/contracts/shared'
import { z } from 'zod'

/** `GET /api/posts` success body (trending or following feed). */
export const postsFeedSuccessSchema = z.object({
  posts: z.array(postInFeedSchema),
  nextCursor: z.string().nullable()
})

/** `GET /api/posts` when unauthenticated. */
export const postsFeedUnauthorizedSchema = z.object({
  posts: z.array(z.never()),
  nextCursor: z.null()
})

/** `POST /api/posts` success — populated post document. */
export const postsCreateSuccessSchema = postInFeedSchema

export type PostsFeedSuccessResponse = z.infer<typeof postsFeedSuccessSchema>
export type PostsFeedUnauthorizedResponse = z.infer<
  typeof postsFeedUnauthorizedSchema
>
export type PostsCreateSuccessResponse = z.infer<
  typeof postsCreateSuccessSchema
>
