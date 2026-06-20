'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/user'
import { ChatRoomProvider } from '@ably/chat/react'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'

import type { IConversation } from '@/types/conversation'
import ChatWindow from '@/components/chat/ChatWindow'
import Contacts from '@/components/chat/Contacts'
import GroupChatHeader from '@/components/chat/GroupChatHeader'
import MessagesEmptyPane from '@/components/chat/MessagesEmptyPane'
import {
  getConversationHeaderParticipants,
  getMessagesAsideClassName
} from '@/components/chat/messagesLayout'
import { NewChatModal } from '@/components/chat/NewChatModal'

const MessagesWithAbly = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [showContactsSidebar, setShowContactsSidebar] = useState(false)
  const { user: currentUser } = useUserStore()

  const {
    data: conversations = [],
    isLoading: isConversationsLoading,
    refetch: refetchConversations
  } = useQuery<IConversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/conversations')
      const json = await res.json()
      return json.data || []
    }
  })

  const hasConversations = conversations.length > 0
  const showMobileConversationList =
    !selectedId && hasConversations && !isConversationsLoading

  const selectedConversation =
    conversations.find((conversation) => conversation._id === selectedId) ??
    null

  const { participants: headerParticipants, isGroup } =
    getConversationHeaderParticipants(selectedConversation, currentUser?._id)

  const handleOpenNewChat = async () => {
    setShowNewChat(true)
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

  const handleSelectUser = async (user: { _id: string }) => {
    setShowNewChat(false)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds: [user._id] })
      })
      const json = await res.json()
      if (json.data?._id) {
        setSelectedId(json.data._id)
        refetchConversations()
        setShowContactsSidebar(false)
      }
    } catch {
      setUsersError('Failed to start chat')
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedId(conversationId)
    setShowContactsSidebar(false)
  }

  const handleBackToConversations = () => {
    setSelectedId(null)
    setShowContactsSidebar(false)
  }

  const asideClassName = getMessagesAsideClassName({
    showMobileConversationList,
    showContactsSidebar,
    selectedId
  })

  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full overflow-hidden bg-white',
        'max-lg:rounded-none max-lg:border-0',
        'lg:rounded-lg lg:border'
      )}
    >
      {showContactsSidebar && !showMobileConversationList && (
        <button
          type="button"
          aria-label="Close conversations"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setShowContactsSidebar(false)}
        />
      )}

      <aside className={asideClassName}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showContactsSidebar && !showMobileConversationList && (
              <button
                type="button"
                onClick={() => setShowContactsSidebar(false)}
                className="rounded-full p-1 hover:bg-gray-100 lg:hidden"
                aria-label="Close conversations"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <span className="text-base font-semibold text-gray-900">Chats</span>
          </div>
          <button
            type="button"
            className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-[#0EA5E9] transition hover:bg-[#0EA5E9] hover:text-white"
            onClick={handleOpenNewChat}
          >
            + New Chat
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Contacts
            conversations={conversations}
            selectedId={selectedId}
            setSelectedId={handleSelectConversation}
            refetchConversations={refetchConversations}
          />
        </div>
      </aside>

      <main
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white',
          showMobileConversationList && 'max-lg:hidden'
        )}
      >
        {selectedConversation ? (
          <>
            <GroupChatHeader
              participants={headerParticipants}
              isGroup={isGroup}
              onBack={handleBackToConversations}
            />
            {selectedId && (
              <div className="flex min-h-0 flex-1 basis-0 flex-col overflow-hidden">
                <ChatRoomProvider name={selectedId}>
                  <ChatWindow key={selectedId} conversationId={selectedId} />
                </ChatRoomProvider>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 text-gray-400">
            <MessagesEmptyPane
              isLoading={isConversationsLoading}
              hasConversations={hasConversations}
              onNewChat={handleOpenNewChat}
            />
          </div>
        )}
      </main>

      <NewChatModal
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        users={users}
        isLoading={usersLoading}
        error={usersError}
        onSelectUser={handleSelectUser}
      />
    </div>
  )
}

export default MessagesWithAbly
