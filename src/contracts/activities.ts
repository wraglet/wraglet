import {
  isoDateStringSchema,
  objectIdStringSchema,
  userPopulationSnippetSchema
} from '@/contracts/shared'
import { z } from 'zod'

const activityPostDataSchema = z.object({
  postId: objectIdStringSchema,
  content: z.string()
})

const activityFollowDataSchema = z.object({
  followedUser: userPopulationSnippetSchema
})

export const activityItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('post'),
    user: userPopulationSnippetSchema,
    action: z.literal('posted a new update'),
    timestamp: isoDateStringSchema,
    data: activityPostDataSchema
  }),
  z.object({
    type: z.literal('follow'),
    user: userPopulationSnippetSchema,
    action: z.string(),
    timestamp: isoDateStringSchema,
    data: activityFollowDataSchema
  })
])

export const activitiesSuccessSchema = z.object({
  success: z.literal(true),
  activities: z.array(activityItemSchema)
})

export type ActivityItem = z.infer<typeof activityItemSchema>
export type ActivitiesSuccessResponse = z.infer<typeof activitiesSuccessSchema>
