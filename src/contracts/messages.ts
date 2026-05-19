import { messageSchema } from '@/contracts/shared'
import { z } from 'zod'

export { apiErrorBodySchema as messagesErrorSchema } from '@/contracts/shared'

export const messagesListSuccessSchema = z.object({
  success: z.literal(true),
  data: z.array(messageSchema)
})

export const messagesMutationSuccessSchema = z.object({
  success: z.literal(true),
  data: messageSchema
})

export type MessagesListSuccess = z.infer<typeof messagesListSuccessSchema>
export type MessagesMutationSuccess = z.infer<
  typeof messagesMutationSuccessSchema
>
