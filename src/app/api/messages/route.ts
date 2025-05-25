'use server'

import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { getAblyInstance } from '@/lib/ably'
import client from '@/lib/db'
import Conversation from '@/models/Conversation'
import Message from '@/models/Message'

// GET: List messages in a conversation
export const GET = async (req: Request) => {
  try {
    await client()
    const conversationId = req.headers.get('x-conversation-id')
    if (!conversationId)
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      )

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'firstName lastName username profilePicture')
      .sort({ createdAt: 1 })
      .lean()

    return NextResponse.json({ success: true, data: messages })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST: Send a message
export const POST = async (req: Request) => {
  try {
    await client()
    const body = await req.json()
    const { conversationId, content, attachments } = body
    const currentUser = await getCurrentUser()
    const userId = currentUser?._id
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content required' },
        { status: 400 }
      )
    }
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content,
      attachments
    })
    // Populate sender info for real-time UI
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName username profilePicture')
      .lean()
    // Update lastMessage in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id
    })
    // Publish Ably event to update header badge for recipients
    const convoAfter: any = await Conversation.findById(conversationId).lean()
    const ably = getAblyInstance()
    if (convoAfter && Array.isArray(convoAfter.participants)) {
      for (const participant of convoAfter.participants) {
        if (participant.toString() !== userId.toString()) {
          ably.channels.get(`user-${participant}-messages`).publish('unread', {
            conversationId
            // Optionally, you can recalculate unreadCount here if needed
          })
        }
      }
    }
    return NextResponse.json({ success: true, data: populatedMessage })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
