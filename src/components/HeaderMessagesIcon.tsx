'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import useChatFloaterStore from '@/store/chatFloater'
import useUserStore from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import { useChannel } from 'ably/react'

import Avatar from '@/components/Avatar'
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
  const { user: currentUser } = useUserStore()

  const {
    data: conversations = [],
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: ['header-conversations'],
    queryFn: async () => {
      const res = await fetch('/api/conversations')
      const json = await res.json()
      return json.data || []
    },
    enabled: dropdownOpen
  })

  console.log('HeaderMessagesIcon subscribing to:', `user-${userId}-messages`)
  useChannel(`user-${userId}-messages`, (message) => {
    console.log('Ably event:', message)
    setUnreadCount((prev) =>
      typeof message.data?.unreadCount === 'number'
        ? message.data.unreadCount
        : prev + 1
    )
    if (dropdownOpen) refetch()
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
  const handleMessageClick = async (conversationId: string) => {
    // Mark as read
    try {
      await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      })
      // Refetch conversations and unread count
      refetch()
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0))
    } catch {}
    // Open chat floater
    useChatFloaterStore.getState().openChat(conversationId)
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
            {loading ? (
              <li className="p-4 text-center text-gray-400">Loading...</li>
            ) : conversations.length === 0 ? (
              <li className="p-4 text-center text-gray-400">
                No recent messages
              </li>
            ) : (
              (conversations as any[]).map((c: any) => {
                let displayUsers = c.participants
                if (!c.isGroup && currentUser?._id) {
                  displayUsers = c.participants.filter(
                    (p: any) => p._id !== currentUser._id
                  )
                }
                const lastMsg = c.lastMessage
                return (
                  <li
                    key={c._id}
                    className={`flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-blue-50 ${c.unreadCount ? 'font-bold text-blue-700' : 'text-gray-700'}`}
                    onClick={() => handleMessageClick(c._id)}
                  >
                    {c.isGroup ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                        {displayUsers
                          .slice(0, 2)
                          .map((u: any) => u.firstName[0])
                          .join('')}
                      </span>
                    ) : (
                      <Avatar
                        src={
                          displayUsers[0]?.profilePicture?.url ||
                          displayUsers[0]?.profilePicture ||
                          null
                        }
                        gender={displayUsers[0]?.gender}
                        alt={displayUsers[0]?.firstName}
                        className="h-8 w-8"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate">
                        {c.isGroup
                          ? displayUsers
                              .map((u: any) => `${u.firstName} ${u.lastName}`)
                              .join(', ')
                          : `${displayUsers[0]?.firstName} ${displayUsers[0]?.lastName}`}
                      </div>
                      {lastMsg && (
                        <div className="truncate text-xs text-gray-500">
                          {lastMsg.sender?._id === currentUser?._id
                            ? 'You: '
                            : ''}
                          {lastMsg.content}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {lastMsg && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                      {c.unreadCount ? (
                        <span className="ml-2 h-2 w-2 rounded-full bg-blue-500" />
                      ) : null}
                      {c.unreadCount ? (
                        <span className="ml-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                          {c.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </li>
                )
              })
            )}
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
