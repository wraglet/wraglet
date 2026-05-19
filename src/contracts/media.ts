import { mediaUploadSuccessSchema, publicUserSchema } from '@/contracts/shared'
import { z } from 'zod'

export {
  publicUserSchema as updateProfileSuccessSchema,
  publicUserSchema as updateCoverSuccessSchema,
  publicUserSchema as updatePhotoCollectionUserSchema,
  photoCollectionItemSchema as updatePhotoCollectionUploadSchema
} from '@/contracts/shared'

export type MediaUploadSuccess = z.infer<typeof mediaUploadSuccessSchema>
export type PublicUserResponse = z.infer<typeof publicUserSchema>
