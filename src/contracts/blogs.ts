import type {
  blogCommentSchema,
  blogCoreSchema,
  blogsListSuccessSchema
} from '@/contracts/shared'
import type { z } from 'zod'

export {
  blogCommentSchema,
  blogCoreSchema,
  blogsListSuccessSchema,
  apiErrorBodySchema as blogsListErrorSchema,
  blogCoreSchema as blogCreateSuccessSchema,
  blogCoreSchema as blogDetailSchema,
  mediaUploadSuccessSchema as blogUploadImageSuccessSchema
} from '@/contracts/shared'

export type BlogsListSuccess = z.infer<typeof blogsListSuccessSchema>
export type BlogDetail = z.infer<typeof blogCoreSchema>
export type BlogComment = z.infer<typeof blogCommentSchema>
