import { ablyTokenRequestSchema } from '@/contracts/shared'
import { z } from 'zod'

export {
  ablyTokenRequestSchema as tokenSuccessSchema,
  apiErrorBodySchema as tokenUnauthorizedSchema,
  ablyTokenErrorSchema as tokenServerErrorSchema
} from '@/contracts/shared'

export type TokenSuccessResponse = z.infer<typeof ablyTokenRequestSchema>
