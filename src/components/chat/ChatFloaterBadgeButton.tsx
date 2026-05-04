'use client'

import { useEffect, useState } from 'react'
import { useChannel } from 'ably/react'

import { ChatIcon } from '@/components/shared/NavIcons'

interface ChatFloaterBadgeButtonProps {
  userId: string
  onClick?: () => void
}

const ChatFloaterBadgeButton = ({
  userId,
  onClick
}: ChatFloaterBadgeButtonProps) => {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await fetch('/api/conversations')
        const json = await response.json()
        const conversations = Array.isArray(json.data) ? json.data : []
        const totalUnreadCount = conversations.reduce(
          (total: number, conversation: { unreadCount?: number }) =>
            total + (conversation.unreadCount || 0),
          0
        )

        setUnreadCount(totalUnreadCount)
      } catch {
        setUnreadCount(0)
      }
    }

    void loadUnreadCount()
  }, [userId])

  useChannel(`user-${userId}-messages`, (message) => {
    if (typeof message.data?.totalUnreadCount === 'number') {
      setUnreadCount(message.data.totalUnreadCount)
    } else if (typeof message.data?.unreadCount === 'number') {
      setUnreadCount(message.data.unreadCount)
    } else {
      setUnreadCount((prev) => prev + 1)
    }
  })

  return (
    <button
      type="button"
      title="Chats"
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-[0_8px_28px_-8px_rgba(14,165,233,0.5)] ring-2 ring-sky-200/50 backdrop-blur-md transition hover:scale-105 hover:shadow-[0_10px_34px_-8px_rgba(14,165,233,0.55)] hover:ring-sky-300/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 active:scale-95 sm:h-12 sm:w-12"
      aria-label="Open chat"
      onClick={onClick}
    >
      <ChatIcon className="h-5 w-5 text-sky-600 sm:h-6 sm:w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-rose-500 to-red-600 px-1 text-[10px] font-bold text-white tabular-nums shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

export default ChatFloaterBadgeButton
