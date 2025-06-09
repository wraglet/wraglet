import { getAblyInstance } from '@/lib/ably'
import client from '@/lib/db'
import Notification, { INotification } from '@/models/Notification'
import User from '@/models/User'

export interface CreateNotificationData {
  recipient: string
  sender?: string
  type: INotification['type']
  title: string
  message: string
  data?: INotification['data']
}

export const createNotification = async (
  notificationData: CreateNotificationData
): Promise<INotification | null> => {
  try {
    await client()

    const notification = await Notification.create(notificationData)

    // Populate sender information for real-time update
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'firstName lastName username profilePicture')
      .lean()

    // Send real-time notification via Ably
    try {
      const ably = getAblyInstance()
      ably.channels
        .get(`user-${notificationData.recipient}-notifications`)
        .publish('new-notification', {
          notification: populatedNotification,
          unreadCount: await getUnreadNotificationCount(
            notificationData.recipient
          )
        })
    } catch (ablyError) {
      console.error('Failed to send real-time notification:', ablyError)
    }

    return populatedNotification as unknown as INotification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

export const getUnreadNotificationCount = async (
  userId: string
): Promise<number> => {
  try {
    await client()
    return await Notification.countDocuments({ recipient: userId, read: false })
  } catch (error) {
    console.error('Error getting unread notification count:', error)
    return 0
  }
}

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<boolean> => {
  try {
    await client()
    await Notification.updateOne(
      { _id: notificationId, recipient: userId },
      { read: true }
    )

    // Send updated unread count via Ably
    try {
      const ably = getAblyInstance()
      ably.channels
        .get(`user-${userId}-notifications`)
        .publish('unread-count', {
          unreadCount: await getUnreadNotificationCount(userId)
        })
    } catch (ablyError) {
      console.error('Failed to send unread count update:', ablyError)
    }

    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

export const markAllNotificationsAsRead = async (
  userId: string
): Promise<boolean> => {
  try {
    await client()
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    )

    // Send updated unread count via Ably
    try {
      const ably = getAblyInstance()
      ably.channels
        .get(`user-${userId}-notifications`)
        .publish('unread-count', {
          unreadCount: 0
        })
    } catch (ablyError) {
      console.error('Failed to send unread count update:', ablyError)
    }

    return true
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
}

// Notification creation helpers for specific types
export const createFollowNotification = async (
  followerId: string,
  followingId: string
) => {
  // Get follower details
  const follower = (await User.findById(followerId)
    .select('firstName lastName')
    .lean()) as any
  if (!follower) return null

  return createNotification({
    recipient: followingId,
    sender: followerId,
    type: 'follow',
    title: 'New Follower',
    message: `${follower.firstName} ${follower.lastName} started following you`,
    data: { userId: followerId }
  })
}

export const createCommentNotification = async (
  commenterId: string,
  postAuthorId: string,
  postId: string,
  commentId: string
) => {
  // Don't notify if user comments on their own post
  if (commenterId === postAuthorId) return null

  const commenter = (await User.findById(commenterId)
    .select('firstName lastName')
    .lean()) as any
  if (!commenter) return null

  return createNotification({
    recipient: postAuthorId,
    sender: commenterId,
    type: 'comment',
    title: 'New Comment',
    message: `${commenter.firstName} ${commenter.lastName} commented on your post`,
    data: { postId, commentId, userId: commenterId }
  })
}

export const createReactionNotification = async (
  reactorId: string,
  postAuthorId: string,
  postId: string,
  reactionType: string,
  shareId?: string
) => {
  // Don't notify if user reacts to their own post
  if (reactorId === postAuthorId) return null

  const reactor = (await User.findById(reactorId)
    .select('firstName lastName')
    .lean()) as any
  if (!reactor) return null

  return createNotification({
    recipient: postAuthorId,
    sender: reactorId,
    type: 'reaction',
    title: 'New Reaction',
    message: `${reactor.firstName} ${reactor.lastName} reacted to your ${shareId ? 'shared post' : 'post'}`,
    data: {
      postId,
      reactionType,
      userId: reactorId,
      ...(shareId && { shareId }) // Include shareId if it's a reaction on a share
    }
  })
}

export const createNewPostNotification = async (
  authorId: string,
  followerIds: string[],
  postId: string
) => {
  const author = (await User.findById(authorId)
    .select('firstName lastName')
    .lean()) as any
  if (!author) return null

  // Create notifications for all followers
  const notifications = followerIds.map((followerId) =>
    createNotification({
      recipient: followerId,
      sender: authorId,
      type: 'new_post',
      title: 'New Post',
      message: `${author.firstName} ${author.lastName} shared a new post`,
      data: { postId, userId: authorId }
    })
  )

  return Promise.all(notifications)
}

export const createShareNotification = async (
  sharerId: string,
  postAuthorId: string,
  postId: string,
  shareId: string
) => {
  // Don't notify if user shares their own post
  if (sharerId === postAuthorId) return null

  const sharer = (await User.findById(sharerId)
    .select('firstName lastName')
    .lean()) as any
  if (!sharer) return null

  return createNotification({
    recipient: postAuthorId,
    sender: sharerId,
    type: 'share',
    title: 'Post Shared',
    message: `${sharer.firstName} ${sharer.lastName} shared your post`,
    data: { postId, shareId, userId: sharerId }
  })
}

export const createAdminNotification = async (
  recipientId: string,
  title: string,
  message: string,
  data?: any
) => {
  return createNotification({
    recipient: recipientId,
    type: 'admin',
    title,
    message,
    data
  })
}

export const createSystemNotification = async (
  recipientId: string,
  title: string,
  message: string,
  data?: any
) => {
  return createNotification({
    recipient: recipientId,
    type: 'system',
    title,
    message,
    data
  })
}
