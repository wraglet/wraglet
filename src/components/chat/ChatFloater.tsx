'use client'

import { useEffect, useState } from 'react'
import { mobileFabStackBottomClassName } from '@/lib/uiChrome'
import useChatFloaterStore from '@/store/chatFloater'
import useUserStore from '@/store/user'
import { getConversationFloaterDisplay } from '@/utils/conversationFloaterDisplay'
import { ChatRoomProvider } from '@ably/chat/react'
import { useQueryClient } from '@tanstack/react-query'
import { ChannelProvider } from 'ably/react'

import type { IConversation } from '@/types/conversation'
import ChatFloaterBadgeButton from '@/components/chat/ChatFloaterBadgeButton'
import ChatFloaterIncomingListener from '@/components/chat/ChatFloaterIncomingListener'
import ChatFloaterRecentPanel from '@/components/chat/ChatFloaterRecentPanel'
import ChatWindow from '@/components/chat/ChatWindow'
import { NewChatModal } from '@/components/chat/NewChatModal'
import Avatar from '@/components/shared/Avatar'

const ChatFloater = ({ conversations }: { conversations: IConversation[] }) => {
  const { openChats, closeChat, openChat, minimizedChats, minimizeChat } =
    useChatFloaterStore()
  const queryClient = useQueryClient()
  const { user: currentUser } = useUserStore()
  const [showChatHeads, setShowChatHeads] = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  useEffect(() => {
    if (showChatHeads && currentUser?._id) {
      void queryClient.invalidateQueries({
        queryKey: ['conversations', currentUser._id]
      })
    }
  }, [showChatHeads, currentUser?._id, queryClient])

  const handleOpenNewChat = async () => {
    setNewChatOpen(true)
    setUsersLoading(true)
    setUsersError(null)
    try {
      const res = await fetch('/api/users')
      const json = await res.json()
      setUsers(json.users || [])
    } catch {
      setUsersError('Failed to load users')
    } finally {
      setUsersLoading(false)
    }
  }

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
    } catch {
      setUsersError('Failed to start chat')
    }
  }

  const handleOpenConversationFromPanel = (conversationId: string) => {
    openChat(conversationId)
    setShowChatHeads(false)
  }

  return (
    <>
      {currentUser?._id && (
        <ChannelProvider channelName={`user-${currentUser._id}-messages`}>
          <ChatFloaterIncomingListener
            userId={currentUser._id}
            onIncomingPinned={() => setShowChatHeads(true)}
          />
          <div
            className={`fixed right-3 z-50 flex flex-col items-end gap-2 sm:right-5 ${mobileFabStackBottomClassName} lg:right-6 lg:bottom-6`}
          >
            {showChatHeads && (
              <ChatFloaterRecentPanel
                conversations={conversations}
                minimizedChats={minimizedChats}
                currentUserId={currentUser?._id}
                onOpenConversation={handleOpenConversationFromPanel}
                onAddChat={handleOpenNewChat}
              />
            )}
            <ChatFloaterBadgeButton
              userId={currentUser._id}
              onClick={() => setShowChatHeads((v) => !v)}
            />
          </div>
        </ChannelProvider>
      )}
      <div
        className={`fixed right-[4.25rem] z-50 flex gap-4 ${mobileFabStackBottomClassName} lg:bottom-4`}
      >
        {openChats.map((chat) => {
          const convo = conversations.find(
            (c: any) => c._id === chat.conversationId
          )
          const info = getConversationFloaterDisplay(convo, currentUser?._id)
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
                      gender={info.gender}
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
                  <button
                    type="button"
                    className="px-1 text-gray-500 hover:text-yellow-500"
                    title="Minimize"
                    onClick={() => minimizeChat(chat.conversationId)}
                  >
                    _
                  </button>
                  <button
                    type="button"
                    className="px-1 text-gray-500 hover:text-red-500"
                    title="Close"
                    onClick={() => closeChat(chat.conversationId)}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 text-sm text-gray-500">
                <ChatRoomProvider name={chat.conversationId}>
                  <ChatWindow
                    key={chat.conversationId}
                    conversationId={chat.conversationId}
                  />
                </ChatRoomProvider>
              </div>
            </div>
          )
        })}
      </div>
      <NewChatModal
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSelectUser={handleSelectUser}
        users={users}
        isLoading={usersLoading}
        error={usersError}
      />
    </>
  )
}

export default ChatFloater
