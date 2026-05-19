import { z } from 'zod'

export const trendingTopicSchema = z.object({
  tag: z.string(),
  count: z.number().int().positive()
})

export const topicsTrendingSuccessSchema = z.object({
  success: z.literal(true),
  topics: z.array(trendingTopicSchema)
})

export type TopicsTrendingSuccess = z.infer<typeof topicsTrendingSuccessSchema>
