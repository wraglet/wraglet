'use server'

import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { getAblyInstance } from '@/lib/ably'
import client from '@/lib/db'
import Conversation from '@/models/Conversation'

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

    return NextResponse.json({ success: true, data: conversations })
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
