'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useChannel } from 'ably/react'

import { ChatIcon } from '@/components/NavIcons'

interface HeaderMessagesIconProps {
  userId: string
  initialUnreadCount?: number // Optional: for SSR hydration
  ablyError?: boolean // Optional: for fallback UI
}

const HeaderMessagesIcon = ({
  userId,
  initialUnreadCount = 0,
  ablyError = false
}: HeaderMessagesIconProps) => {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Real-time unread badge updates
  useChannel(`user-${userId}-messages`, (message) => {
    if (typeof message.data?.unreadCount === 'number') {
      setUnreadCount(message.data.unreadCount)
    } else {
      setUnreadCount((prev) => prev + 1)
    }
  })

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // Handler for clicking a message
  const handleMessageClick = (messageId: string) => {
    // TODO: Open/toggle the floating chatbox for this message
    setDropdownOpen(false)
  }

  return (
    <div className="relative flex" ref={dropdownRef}>
      <button
        className="relative focus:outline-none"
        onClick={() => setDropdownOpen((open) => !open)}
        aria-label="Open messages"
      >
        <ChatIcon className="h-5 w-5 text-white" />
        {ablyError ? (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs font-bold text-white">
            ?
          </span>
        ) : (
          unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )
        )}
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-9 w-80 rounded-lg border bg-white shadow-lg">
          <div className="border-b p-2 font-semibold text-gray-700">
            Messages
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {/* Placeholder: recent messages */}
            {/* {recentMessages.length === 0 && (
              <li className="p-4 text-center text-gray-400">
                No recent messages
              </li>
            )} */}
            {/* {recentMessages.map((msg) => (
              <li
                key={msg.id}
                className={`flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-blue-50 ${msg.unread ? 'font-bold text-blue-700' : 'text-gray-700'}`}
                onClick={() => handleMessageClick(msg.id)}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                  {msg.from[0]}
                </span>
                <div className="flex-1">
                  <div className="truncate">{msg.from}</div>
                  <div className="truncate text-xs text-gray-500">
                    {msg.text}
                  </div>
                </div>
                {msg.unread && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </li>
            ))} */}
          </ul>
          <div className="border-t p-2 text-center">
            <Link
              href="/messages"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              See all messages
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default HeaderMessagesIcon
