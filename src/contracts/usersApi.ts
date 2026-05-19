import {
  discoverUserSchema,
  trendingUserSchema,
  userPopulationSnippetSchema
} from '@/contracts/shared'
import { z } from 'zod'

export { passwordPatchSuccessSchema as usersPasswordPatchSuccessSchema } from '@/contracts/shared'

/** `PATCH /api/users` success — user doc without `hashedPassword`. */
export const usersPatchSuccessSchema = z.object({
  success: z.literal(true),
  user: z
    .object({
      _id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      username: z.string()
    })
    .passthrough()
})

/** `GET /api/users` (settings list). */
export const usersListSuccessSchema = z.object({
  success: z.literal(true),
  users: z.array(userPopulationSnippetSchema)
})

export const usersTrendingSuccessSchema = z.object({
  success: z.literal(true),
  users: z.array(trendingUserSchema)
})

export const usersSuggestedSuccessSchema = z.object({
  success: z.literal(true),
  users: z.array(trendingUserSchema)
})

export const usersDiscoverSuccessSchema = z.object({
  success: z.literal(true),
  users: z.array(discoverUserSchema)
})

export const usersPeopleYouMayKnowSuccessSchema = z.object({
  success: z.literal(true),
  users: z.array(userPopulationSnippetSchema)
})

export { apiErrorBodySchema as usersUnauthorizedSchema } from '@/contracts/shared'

export type TrendingUser = z.infer<typeof trendingUserSchema>
export type DiscoverUser = z.infer<typeof discoverUserSchema>

export type UsersPatchSuccess = z.infer<typeof usersPatchSuccessSchema>
export type UsersListSuccess = z.infer<typeof usersListSuccessSchema>
export type UsersTrendingSuccess = z.infer<typeof usersTrendingSuccessSchema>
