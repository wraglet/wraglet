import { notificationItemSchema } from '@/contracts/shared'
import { z } from 'zod'

export const notificationsListSchema = z.object({
  notifications: z.array(notificationItemSchema),
  unreadCount: z.number().int().nonnegative(),
  hasMore: z.boolean(),
  nextCursor: z.string().nullable()
})

export const notificationsPatchSuccessSchema = z.object({
  success: z.literal(true),
  unreadCount: z.number().int().nonnegative()
})

export type NotificationsListResponse = z.infer<typeof notificationsListSchema>
export type NotificationsPatchSuccessResponse = z.infer<
  typeof notificationsPatchSuccessSchema
>
