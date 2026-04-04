'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useChannel } from 'ably/react'

import useChatFloaterStore from '@/store/chatFloater'

type MessagePayload = {
  conversationId?: string
  unreadCount?: number
}

interface ChatFloaterIncomingListenerProps {
  userId: string
  onIncomingPinned?: () => void
}

/**
 * Listens for Ably events on the user messages channel so incoming chats
 * appear as clickable heads in the floater (not only as a badge count).
 */
const ChatFloaterIncomingListener = ({
  userId,
  onIncomingPinned
}: ChatFloaterIncomingListenerProps) => {
  const queryClient = useQueryClient()
  const pinIncomingChat = useChatFloaterStore((s) => s.pinIncomingChat)

  useChannel(`user-${userId}-messages`, (message) => {
    const data = message.data as MessagePayload | undefined
    const conversationId = data?.conversationId
    if (!conversationId) return

    if (message.name === 'new-chat') {
      pinIncomingChat(conversationId)
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
      void queryClient.invalidateQueries({ queryKey: ['header-conversations'] })
      onIncomingPinned?.()
      return
    }

    if (message.name === 'unread') {
      // PATCH /api/conversations publishes unreadCount: 0 when marking read — do not pin
      if (data.unreadCount === 0) return
      pinIncomingChat(conversationId)
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
      void queryClient.invalidateQueries({ queryKey: ['header-conversations'] })
      onIncomingPinned?.()
    }
  })

  return null
}

export default ChatFloaterIncomingListener
