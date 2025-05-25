'use client'

import { useState } from 'react'
import { useChannel } from 'ably/react'

import { ChatIcon } from '@/components/NavIcons'

interface FloaterChat {
  id: string
  name: string
}

const ChatFloater = ({ userId }: { userId: string }) => {
  const [openChats, setOpenChats] = useState<FloaterChat[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Real-time unread badge updates
  useChannel(`user-${userId}-messages`, (message) => {
    if (typeof message.data?.unreadCount === 'number') {
      setUnreadCount(message.data.unreadCount)
    } else {
      setUnreadCount((prev) => prev + 1)
    }
  })

  // Placeholder: Add a chat window for demo
  const handleOpenChat = () => {
    setOpenChats((prev) => [
      ...prev,
      { id: Math.random().toString(), name: 'Demo Chat' + (prev.length + 1) }
    ])
  }

  const handleCloseChat = (id: string) => {
    setOpenChats((prev) => prev.filter((chat) => chat.id !== id))
  }

  return (
    <>
      {/* Floating chat icon button */}
      <button
        className="fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-[#BFE6FC] shadow-md transition hover:ring-2 hover:ring-blue-300 focus:outline-none"
        onClick={handleOpenChat}
        aria-label="Open chat"
      >
        <ChatIcon className="h-6 w-6 text-[#0EA5E9]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {/* Floating chat windows */}
      <div className="fixed right-24 bottom-4 z-50 flex gap-4">
        {openChats.map((chat) => (
          <div
            key={chat.id}
            className="flex w-80 flex-col rounded-lg border bg-white shadow-lg"
          >
            <div className="flex items-center justify-between border-b bg-gray-100 p-2">
              <span className="font-semibold">{chat.name}</span>
              <button
                className="text-gray-500 hover:text-red-500"
                onClick={() => handleCloseChat(chat.id)}
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 text-sm text-gray-500">
              (Chat messages go here)
            </div>
            <div className="border-t p-2">
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Type a message..."
                disabled
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default ChatFloater
