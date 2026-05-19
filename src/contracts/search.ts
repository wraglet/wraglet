import { z } from 'zod'

/** Matches `Gender` in `@/interfaces` — use for search result payloads. */
export const searchResultGenderSchema = z.enum([
  'Female',
  'Male',
  'Others',
  'Prefer not to say'
])

export const searchResultItemSchema = z.object({
  _id: z.string(),
  type: z.enum(['user', 'post', 'blog', 'video']),
  title: z.string(),
  subtitle: z.string().optional(),
  avatar: z.string().optional(),
  gender: searchResultGenderSchema,
  url: z.string(),
  relevanceScore: z.number().optional()
})

export const searchResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(searchResultItemSchema),
  totalCount: z.number(),
  query: z.string()
})

export type SearchResponseContract = z.infer<typeof searchResponseSchema>
export type SearchResultItemContract = z.infer<typeof searchResultItemSchema>
