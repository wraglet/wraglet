import { apiSuccessFalseSchema, conversationSchema } from '@/contracts/shared'
import { z } from 'zod'

export {
  apiErrorBodySchema as conversationsUnauthorizedSchema,
  apiSuccessFalseSchema as conversationsErrorSchema
} from '@/contracts/shared'

export const conversationsListSuccessSchema = z.object({
  success: z.literal(true),
  data: z.array(conversationSchema)
})

export type ConversationsListSuccess = z.infer<
  typeof conversationsListSuccessSchema
>
export type ConversationsErrorBody = z.infer<typeof apiSuccessFalseSchema>
