import Conversation from '@/models/Conversation'
import Message from '@/models/Message'
import type { Types } from 'mongoose'

interface LastReadEntry {
  user: { toString: () => string }
  at?: Date
}

interface ConversationUnreadSource {
  _id: { toString: () => string }
  lastRead?: LastReadEntry[]
}

/** Lean shape returned by `.select('_id lastRead').lean()` — matches schema. */
type ConversationUnreadLean = {
  _id: Types.ObjectId
  lastRead?: Array<{ user: Types.ObjectId; at?: Date }>
}

const toUnreadSource = (
  doc: ConversationUnreadLean
): ConversationUnreadSource => ({
  _id: doc._id,
  lastRead: doc.lastRead
})

export const getConversationUnreadCount = async (
  conversation: ConversationUnreadSource,
  userId: string
) => {
  const lastRead = (conversation.lastRead || []).find(
    (entry) => entry.user.toString() === userId
  )
  const lastReadAt = lastRead?.at || new Date(0)

  return Message.countDocuments({
    conversation: conversation._id,
    sender: { $ne: userId },
    createdAt: { $gt: lastReadAt }
  })
}

export const getTotalUnreadMessageCount = async (userId: string) => {
  const raw = await Conversation.find({ participants: userId })
    .select('_id lastRead')
    .lean<ConversationUnreadLean[]>()

  const conversations = raw.map(toUnreadSource)

  const counts = await Promise.all(
    conversations.map((conversation) =>
      getConversationUnreadCount(conversation, userId)
    )
  )

  return counts.reduce((total, count) => total + count, 0)
}
