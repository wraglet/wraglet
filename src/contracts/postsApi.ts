import { postCommentSchema, postDetailSchema } from '@/contracts/shared'
import { z } from 'zod'

export {
  postCommentSchema,
  postDetailSchema,
  apiErrorBodySchema as postDetailErrorSchema,
  postDetailSchema as postMutationSuccessSchema
} from '@/contracts/shared'

export type PostDetailResponse = z.infer<typeof postDetailSchema>
export type PostCommentResponse = z.infer<typeof postCommentSchema>
