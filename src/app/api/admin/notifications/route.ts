import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import {
  createAdminNotification,
  createSystemNotification
} from '@/lib/notifications'
import User from '@/models/User'

export const POST = async (request: Request) => {
  try {
    await client()

    const currentUser = await getCurrentUser()
    if (!currentUser?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For demo purposes, allow any authenticated user to send admin notifications
    // In production, you'd check for admin role here

    const { type, title, message, recipientEmail, data } = await request.json()

    if (!type || !title || !message) {
      return NextResponse.json(
        {
          error: 'Type, title, and message are required'
        },
        { status: 400 }
      )
    }

    if (type !== 'admin' && type !== 'system') {
      return NextResponse.json(
        {
          error: 'Type must be admin or system'
        },
        { status: 400 }
      )
    }

    let recipients: string[] = []

    if (recipientEmail) {
      // Send to specific user
      const user = await User.findOne({ email: recipientEmail })
        .select('_id')
        .lean()
      if (!user) {
        return NextResponse.json(
          {
            error: 'User not found'
          },
          { status: 404 }
        )
      }
      recipients = [(user as any)._id.toString()]
    } else {
      // Send to all users
      const users = await User.find({}).select('_id').lean()
      recipients = users.map((u: any) => u._id.toString())
    }

    // Create notifications for all recipients
    const notifications = await Promise.all(
      recipients.map((recipientId) =>
        type === 'admin'
          ? createAdminNotification(recipientId, title, message, data)
          : createSystemNotification(recipientId, title, message, data)
      )
    )

    const successCount = notifications.filter((n) => n !== null).length

    return NextResponse.json({
      success: true,
      count: successCount,
      message: `Sent ${successCount} notifications`
    })
  } catch (error) {
    console.error('Error sending admin notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
