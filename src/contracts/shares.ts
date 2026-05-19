import type {
  shareDocumentSchema,
  sharesListSuccessSchema
} from '@/contracts/shared'
import type { z } from 'zod'

export {
  shareDocumentSchema,
  sharesListSuccessSchema,
  apiErrorBodySchema as sharesUnauthorizedSchema,
  shareDocumentSchema as shareCreateSuccessSchema,
  postCommentSchema as shareCommentSuccessSchema
} from '@/contracts/shared'

export type SharesListSuccess = z.infer<typeof sharesListSuccessSchema>
export type ShareDocumentResponse = z.infer<typeof shareDocumentSchema>
