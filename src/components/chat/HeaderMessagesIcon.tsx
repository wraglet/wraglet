'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  headerFlyoutMessagesListClassName,
  headerFlyoutPanelClassName
} from '@/lib/headerFlyout'
import useChatFloaterStore from '@/store/chatFloater'
import useUserStore from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import { useChannel } from 'ably/react'

import Avatar from '@/components/shared/Avatar'
import AvatarWithOnlineBadge from '@/components/shared/AvatarWithOnlineBadge'
import { ChatIcon } from '@/components/shared/NavIcons'

interface HeaderMessagesIconProps {
  userId: string
  initialUnreadCount?: number // Optional: for SSR hydration
  ablyError?: boolean // Optional: for fallback UI
}

const headerTriggerClass =
  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0ea5e9] sm:h-10 sm:w-10 sm:focus-visible:ring-offset-2'

const HeaderMessagesIcon = ({
  userId,
  initialUnreadCount = 0,
  ablyError = false
}: HeaderMessagesIconProps) => {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user: currentUser } = useUserStore()

  const updateUnreadCountFromConversations = (conversationsData: any[]) => {
    const totalUnreadCount = conversationsData.reduce(
      (total, conversation) => total + (conversation.unreadCount || 0),
      0
    )

    setUnreadCount(totalUnreadCount)
  }

  const {
    data: conversations = [],
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: ['header-conversations'],
    queryFn: async () => {
      const res = await fetch('/api/conversations')
      const json = await res.json()
      const conversationsData = json.data || []
      updateUnreadCountFromConversations(conversationsData)
      return conversationsData
    },
    enabled: true
  })

  useChannel(`user-${userId}-messages`, (message) => {
    if (typeof message.data?.totalUnreadCount === 'number') {
      setUnreadCount(message.data.totalUnreadCount)
    } else if (typeof message.data?.unreadCount === 'number') {
      setUnreadCount(message.data.unreadCount)
    } else {
      setUnreadCount((prev) => prev + 1)
    }

    if (dropdownOpen) refetch()
  })

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
      const result = await refetch()
      if (Array.isArray(result.data)) {
        updateUnreadCountFromConversations(result.data)
      }
    } catch (error) {
      console.error('Failed to mark conversation as read:', error)
    }
    // Open chat floater
    useChatFloaterStore.getState().openChat(conversationId)
    setDropdownOpen(false)
  }

  let messageList: ReactNode
  if (loading) {
    messageList = <li className="p-4 text-center text-gray-400">Loading...</li>
  } else if (conversations.length === 0) {
    messageList = (
      <li className="p-4 text-center text-gray-400">No recent messages</li>
    )
  } else {
    messageList = (conversations as any[]).map((c: any) => {
      let displayUsers = c.participants
      if (!c.isGroup && currentUser?._id) {
        displayUsers = c.participants.filter(
          (p: any) => p._id !== currentUser._id
        )
      }
      const lastMsg = c.lastMessage
      const conversationName = c.isGroup
        ? displayUsers
            .map((user: any) => `${user.firstName} ${user.lastName}`)
            .join(', ')
        : `${displayUsers[0]?.firstName} ${displayUsers[0]?.lastName}`
      const isUnread = Boolean(c.unreadCount)

      return (
        <li key={c._id}>
          <button
            type="button"
            className={`flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-blue-50 ${isUnread ? 'font-bold text-blue-700' : 'text-gray-700'}`}
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
              <AvatarWithOnlineBadge userId={displayUsers[0]?._id}>
                <Avatar
                  src={displayUsers[0]?.profilePicture?.url}
                  gender={displayUsers[0]?.gender}
                  alt={displayUsers[0]?.firstName}
                  className="h-8 w-8"
                />
              </AvatarWithOnlineBadge>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate">{conversationName}</div>
              {lastMsg && (
                <div className="truncate text-xs text-gray-500">
                  {lastMsg.sender?._id === currentUser?._id ? 'You: ' : ''}
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
              {isUnread && (
                <span className="ml-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                  {c.unreadCount}
                </span>
              )}
            </div>
          </button>
        </li>
      )
    })
  }

  return (
    <div className="relative flex" ref={dropdownRef}>
      <button
        type="button"
        className={headerTriggerClass}
        onClick={() => setDropdownOpen((open) => !open)}
        aria-label="Open messages"
      >
        <ChatIcon className="h-5 w-5" />
        {ablyError ? (
          <span className="absolute -top-0.5 -right-0.5 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full border-2 border-sky-600 bg-slate-500 px-0.5 text-[10px] font-bold text-white shadow-sm">
            ?
          </span>
        ) : (
          unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full border-2 border-sky-600 bg-rose-500 px-1 text-[10px] leading-none font-bold text-white tabular-nums shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )
        )}
      </button>
      {dropdownOpen && (
        <div className={headerFlyoutPanelClassName}>
          <div className="shrink-0 border-b p-2 font-semibold text-gray-700">
            Messages
          </div>
          <ul className={headerFlyoutMessagesListClassName}>{messageList}</ul>
          <div className="shrink-0 border-t p-2 text-center">
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
