import { z } from 'zod'

const followingIdsOnlySchema = z.object({
  followingIds: z.array(z.string())
})

/** `GET /api/follows` when unauthenticated (no `userId`) — same shape as authed list, status 401. */
export const followsUnauthorizedListSchema = followingIdsOnlySchema

/** `GET /api/follows` when signed in without `userId` query. */
export const followsFollowingIdsSchema = followingIdsOnlySchema

/** `GET /api/follows?userId=` */
export const followsProfileCountsSchema = z.object({
  followersCount: z.number(),
  followingCount: z.number(),
  isFollowing: z.boolean()
})

/** `POST` / `DELETE` / error bodies that include `success`. */
export const followsMutationSchema = z.object({
  success: z.boolean(),
  error: z.string().optional()
})

export type FollowsFollowingIdsResponse = z.infer<
  typeof followsFollowingIdsSchema
>
export type FollowsProfileCountsResponse = z.infer<
  typeof followsProfileCountsSchema
>
export type FollowsMutationResponse = z.infer<typeof followsMutationSchema>
