'use client'

import { useState } from 'react'
import useChatFloaterStore from '@/store/chatFloater'
import useUserStore from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import { ChannelProvider } from 'ably/react'

import Avatar from '@/components/Avatar'
import ChatFloaterBadgeButton from '@/components/ChatFloaterBadgeButton'
import ChatWindow from '@/components/messages/ChatWindow'
import { NewChatModal } from '@/components/messages/NewChatModal'

interface FloaterChat {
  id: string
  name: string
}

const ChatFloater = ({ userId }: { userId: string }) => {
  const {
    openChats,
    closeChat,
    openChat,
    minimizedChats,
    minimizeChat,
    restoreChat
  } = useChatFloaterStore()
  const { user: currentUser } = useUserStore()
  const [showChatHeads, setShowChatHeads] = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  // Fetch all conversations for header/chat heads
  const { data: conversations = [] } = useQuery({
    queryKey: ['floater-conversations'],
    queryFn: async () => {
      const res = await fetch('/api/conversations')
      const json = await res.json()
      return json.data || []
    }
  })

  // Helper to get display info for a conversation
  const getDisplayInfo = (convo: any) => {
    if (!convo) return { name: '', avatar: '', isGroup: false, users: [] }
    let displayUsers = convo.participants
    if (!convo.isGroup && currentUser?._id) {
      displayUsers = convo.participants.filter(
        (p: any) => p._id !== currentUser._id
      )
    }
    return {
      name: convo.isGroup
        ? convo.name ||
          displayUsers
            .map((u: any) => `${u.firstName} ${u.lastName}`)
            .join(', ')
        : `${displayUsers[0]?.firstName} ${displayUsers[0]?.lastName}`,
      avatar: convo.isGroup
        ? null
        : displayUsers[0]?.profilePicture?.url ||
          displayUsers[0]?.profilePicture ||
          '',
      isGroup: convo.isGroup,
      users: displayUsers
    }
  }

  // Show chat heads panel if toggled, regardless of minimized chats
  const shouldShowChatHeadsPanel = showChatHeads

  // Open modal and fetch users
  const handleOpenNewChat = async () => {
    setNewChatOpen(true)
    setUsersLoading(true)
    setUsersError(null)
    try {
      const res = await fetch('/api/users')
      const json = await res.json()
      setUsers(json.users || [])
    } catch (e) {
      setUsersError('Failed to load users')
    } finally {
      setUsersLoading(false)
    }
  }

  // Handle selecting a user to chat with
  const handleSelectUser = async (user: any) => {
    setNewChatOpen(false)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds: [user._id] })
      })
      const json = await res.json()
      if (json.data?._id) {
        openChat(json.data._id)
        setShowChatHeads(false)
      }
    } catch (e) {
      // Optionally show error
    }
  }

  return (
    <>
      {/* Chat heads stack (panel always shows when toggled) */}
      {shouldShowChatHeadsPanel && (
        <div className="fixed right-8 bottom-36 z-50 flex flex-col items-center gap-2 lg:bottom-24">
          {/* Minimized chat heads (if any) */}
          {minimizedChats.map((chat) => {
            const convo = conversations.find(
              (c: any) => c._id === chat.conversationId
            )
            const info = getDisplayInfo(convo)
            return (
              <button
                key={chat.conversationId}
                className="group relative flex flex-col items-center"
                onClick={() => restoreChat(chat.conversationId)}
              >
                {info.isGroup ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                    {info.users
                      .slice(0, 2)
                      .map((u: any) => u.firstName[0])
                      .join('')}
                  </div>
                ) : (
                  <Avatar
                    src={info.avatar}
                    alt={info.name}
                    className="h-10 w-10"
                  />
                )}
                {/* Name only on hover */}
                <span className="pointer-events-none absolute top-12 left-1/2 z-10 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg group-hover:opacity-100">
                  {info.name}
                </span>
              </button>
            )
          })}
          {/* Add chat button always present */}
          <button
            className="mt-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-2xl text-white shadow hover:bg-blue-600"
            onClick={handleOpenNewChat}
            aria-label="Add chat"
          >
            +
          </button>
        </div>
      )}
      {/* Floating chat icon button */}
      <ChannelProvider channelName={`user-${userId}-messages`}>
        <span onClick={() => setShowChatHeads((v) => !v)}>
          <ChatFloaterBadgeButton userId={userId} />
        </span>
      </ChannelProvider>
      {/* Floating chat windows */}
      <div className="fixed right-24 bottom-20 z-50 flex gap-4 lg:bottom-4">
        {openChats.map((chat) => {
          const convo = conversations.find(
            (c: any) => c._id === chat.conversationId
          )
          const info = getDisplayInfo(convo)
          return (
            <div
              key={chat.conversationId}
              className="flex w-80 flex-col rounded-lg border bg-white shadow-lg"
              style={{ height: 480 }}
            >
              <div className="flex items-center justify-between border-b bg-gray-100 p-2">
                <div className="flex items-center gap-2">
                  {info.isGroup ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                      {info.users
                        .slice(0, 2)
                        .map((u: any) => u.firstName[0])
                        .join('')}
                    </div>
                  ) : (
                    <Avatar
                      src={info.avatar}
                      alt={info.name}
                      className="h-8 w-8"
                    />
                  )}
                  <span className="max-w-[120px] truncate font-semibold text-gray-900">
                    {info.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Minimize button */}
                  <button
                    className="px-1 text-gray-500 hover:text-yellow-500"
                    title="Minimize"
                    onClick={() => minimizeChat(chat.conversationId)}
                  >
                    _
                  </button>
                  {/* Close button */}
                  <button
                    className="px-1 text-gray-500 hover:text-red-500"
                    onClick={() => closeChat(chat.conversationId)}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 text-sm text-gray-500">
                <ChannelProvider
                  channelName={`conversation-${chat.conversationId}`}
                >
                  <ChatWindow conversationId={chat.conversationId} />
                </ChannelProvider>
              </div>
            </div>
          )
        })}
      </div>
      {/* Add chat modal */}
      <NewChatModal
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSelectUser={handleSelectUser}
        users={users}
        isLoading={usersLoading}
        error={usersError}
        variant="wraglet"
      />
    </>
  )
}

export default ChatFloater
