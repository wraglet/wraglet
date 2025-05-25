'use client'

import { useState } from 'react'
import { useChannel } from 'ably/react'

import { ChatIcon } from '@/components/NavIcons'

const ChatFloaterBadgeButton = ({ userId }: { userId: string }) => {
  const [unreadCount, setUnreadCount] = useState(0)
  useChannel(`user-${userId}-messages`, (message) => {
    if (typeof message.data?.unreadCount === 'number') {
      setUnreadCount(message.data.unreadCount)
    } else {
      setUnreadCount((prev) => prev + 1)
    }
  })

  return (
    <button
      className="fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-[#BFE6FC] shadow-md transition hover:ring-2 hover:ring-blue-300 focus:outline-none"
      aria-label="Open chat"
    >
      <ChatIcon className="h-6 w-6 text-[#0EA5E9]" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white">
          {unreadCount}
        </span>
      )}
    </button>
  )
}

export default ChatFloaterBadgeButton
