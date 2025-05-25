'use server'

import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { getAblyInstance } from '@/lib/ably'
import client from '@/lib/db'
import Conversation from '@/models/Conversation'
import Message from '@/models/Message'

// GET: List all conversations for the authenticated user
export const GET = async (req: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()
    const userId = currentUser?._id
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'firstName lastName username profilePicture')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .lean()

    // For each conversation, calculate unreadCount
    const data = await Promise.all(
      conversations.map(async (c: any) => {
        const lastRead = (c.lastRead || []).find(
          (lr: any) => lr.user.toString() === userId.toString()
        )
        const lastReadAt = lastRead?.at || new Date(0)
        const unreadCount = await Message.countDocuments({
          conversation: c._id,
          createdAt: { $gt: lastReadAt }
        })
        return {
          ...c,
          unreadCount
        }
      })
    )

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// POST: Create a new conversation (group or one-on-one)
export const POST = async (req: Request) => {
  try {
    await client()
    const body = await req.json()
    const { participantIds, isGroup, name } = body
    const currentUser = await getCurrentUser()
    const userId = currentUser?._id
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Participants required' },
        { status: 400 }
      )
    }
    // Always include the creator
    const participants = [...new Set([userId, ...participantIds])]

    // For one-on-one, check if conversation already exists
    if (!isGroup && participants.length === 2) {
      const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: participants, $size: 2 }
      })
      if (existing) {
        // Notify the other user via Ably REST
        try {
          const ably = getAblyInstance()
          const otherUserId = participants.find((id) => id !== userId)
          ably.channels
            .get(`user-${otherUserId}-messages`)
            .publish('new-chat', {
              conversationId: existing._id,
              from: userId
            })
        } catch (e) {}
        return NextResponse.json({ success: true, data: existing })
      }
    }

    // No unreadCounts, just create conversation
    const conversation = await Conversation.create({
      participants,
      isGroup: !!isGroup,
      name: isGroup ? name : undefined
    })
    // Notify the other user via Ably REST
    try {
      if (!isGroup && participants.length === 2) {
        const ably = getAblyInstance()
        const otherUserId = participants.find((id) => id !== userId)
        ably.channels.get(`user-${otherUserId}-messages`).publish('new-chat', {
          conversationId: conversation._id,
          from: userId
        })
      }
    } catch (e) {}
    return NextResponse.json({ success: true, data: conversation })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}

// PATCH: Mark a conversation as read for the current user
export const PATCH = async (req: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()
    const userId = currentUser?._id
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { conversationId } = body
    if (!conversationId)
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      )
    // Get latest message timestamp
    const lastMsg = (await Message.findOne({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .lean()) as any
    const lastReadAt = lastMsg?.createdAt || new Date()
    // Update or add lastRead for this user
    await Conversation.updateOne(
      { _id: conversationId, 'lastRead.user': userId },
      { $set: { 'lastRead.$.at': lastReadAt } }
    )
    await Conversation.updateOne(
      { _id: conversationId, 'lastRead.user': { $ne: userId } },
      { $push: { lastRead: { user: userId, at: lastReadAt } } }
    )
    // Optionally, notify via Ably
    const ably = getAblyInstance()
    ably.channels.get(`user-${userId}-messages`).publish('unread', {
      conversationId,
      unreadCount: 0
    })
    // Return updated conversation
    const updated = await Conversation.findById(conversationId)
      .populate('participants', 'firstName lastName username profilePicture')
      .populate('lastMessage')
      .lean()
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to mark as read' },
      { status: 500 }
    )
  }
}
