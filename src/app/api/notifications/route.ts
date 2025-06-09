import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import {
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '@/lib/notifications'
import Notification from '@/models/Notification'

export const GET = async (request: Request) => {
  try {
    await client()

    const currentUser = await getCurrentUser()
    if (!currentUser?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    let query: any = { recipient: currentUser._id }

    if (unreadOnly) {
      query.read = false
    }

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('sender', 'firstName lastName username profilePicture')
      .lean()

    const hasMore = notifications.length > limit
    const notificationsToReturn = hasMore
      ? notifications.slice(0, -1)
      : notifications
    const nextCursor =
      hasMore && notificationsToReturn.length > 0
        ? notificationsToReturn[
            notificationsToReturn.length - 1
          ].createdAt.toISOString()
        : null

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: currentUser._id,
      read: false
    })

    return NextResponse.json({
      notifications: notificationsToReturn,
      unreadCount,
      hasMore,
      nextCursor
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PATCH = async (request: Request) => {
  try {
    await client()

    const currentUser = await getCurrentUser()
    if (!currentUser?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId, markAllAsRead } = await request.json()

    let success = false

    if (markAllAsRead) {
      success = await markAllNotificationsAsRead(currentUser._id.toString())
    } else if (notificationId) {
      success = await markNotificationAsRead(
        notificationId,
        currentUser._id.toString()
      )
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (success) {
      const unreadCount = await Notification.countDocuments({
        recipient: currentUser._id,
        read: false
      })

      return NextResponse.json({ success: true, unreadCount })
    } else {
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
