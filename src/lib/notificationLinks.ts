import type { INotification } from '@/models/Notification'

const getPostNotificationLink = (postId: string | undefined) =>
  postId ? `/post/${postId}` : '/feed'

export const getNotificationLink = (notification: INotification): string => {
  const { type, data, sender } = notification

  switch (type) {
    case 'follow':
      return `/${sender?.username ?? ''}`

    case 'comment':
      return getPostNotificationLink(data?.postId)

    case 'reaction':
      if (data?.slug && !data.postId) {
        return `/blog/${data.slug}`
      }
      return getPostNotificationLink(data?.postId)

    case 'new_post':
    case 'share':
      return getPostNotificationLink(data?.postId)

    case 'new_blog':
      return data?.slug ? `/blog/${data.slug}` : '/feed'

    case 'admin':
    case 'system':
      return '/feed'

    default:
      return '/feed'
  }
}
