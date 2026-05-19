import { adminNotificationSuccessSchema } from '@/contracts/shared'
import { z } from 'zod'

export {
  adminNotificationSuccessSchema as adminNotificationsPostSuccessSchema,
  apiErrorBodySchema as adminNotificationsErrorSchema
} from '@/contracts/shared'

export type AdminNotificationsPostSuccess = z.infer<
  typeof adminNotificationSuccessSchema
>
