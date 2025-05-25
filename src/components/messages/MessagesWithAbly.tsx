'use client'

import { useState } from 'react'
import useUserStore from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import { ChannelProvider } from 'ably/react'

import type { IConversation } from '@/types/conversation'
import ChatWindow from '@/components/messages/ChatWindow'
import Contacts from '@/components/messages/Contacts'
import GroupChatHeader from '@/components/messages/GroupChatHeader'
import { NewChatModal } from '@/components/messages/NewChatModal'

interface Message {
  _id: string
  sender: any
  content: string
  createdAt: string
}

interface MessagesWithAblyProps {
  conversations?: IConversation[]
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  status: string
}

const MessagesWithAbly = ({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status
}: Omit<MessagesWithAblyProps, 'conversations'>) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const { user: currentUser } = useUserStore()

  // Fetch conversations with useQuery
  const { data: conversations = [], refetch: refetchConversations } = useQuery<
    IConversation[]
  >({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/conversations')
      const json = await res.json()
      return json.data || []
    }
  })

  // Fetch users for new chat modal
  const handleOpenNewChat = async () => {
    setShowNewChat(true)
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
      }
    } catch (e) {
      // Optionally show error
    }
  }

  // Find the selected conversation
  const selectedConversation =
    conversations.find((c: IConversation) => c._id === selectedId) || null
  let headerParticipants: any[] = []
  let isGroup = false
  if (selectedConversation) {
    isGroup = selectedConversation.isGroup
    if (!isGroup && currentUser?._id) {
      headerParticipants = selectedConversation.participants.filter(
        (p: any) => p._id !== currentUser._id
      )
    } else {
      headerParticipants = selectedConversation.participants
    }
  }

  return (
    <div className="flex h-full w-full grow overflow-hidden rounded-lg border bg-white">
      {/* Conversation List */}
      <aside className="w-[320px] max-w-xs flex-shrink-0 overflow-y-auto border-r bg-white p-4">
        <div className="mt-14 mb-4 flex items-center justify-between">
          <span className="text-lg font-bold">Chats</span>
          <button
            className="rounded bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600"
            onClick={handleOpenNewChat}
          >
            + New Chat
          </button>
        </div>
        <NewChatModal
          open={showNewChat}
          onClose={() => setShowNewChat(false)}
          users={users}
          isLoading={usersLoading}
          error={usersError}
          onSelectUser={handleSelectUser}
          variant="wraglet"
        />
        <ChannelProvider channelName="conversations">
          <Contacts
            conversations={conversations}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            refetchConversations={refetchConversations}
          />
        </ChannelProvider>
      </aside>
      {/* Chat Window */}
      <main className="flex min-h-0 flex-1 flex-col">
        {/* Chat header */}
        {selectedConversation && (
          <GroupChatHeader
            participants={headerParticipants}
            isGroup={isGroup}
          />
        )}
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedId ? (
            <div className="text-gray-400">
              (Select a conversation to start chatting)
            </div>
          ) : (
            <ChannelProvider channelName={`conversation-${selectedId}`}>
              <ChatWindow conversationId={selectedId} />
            </ChannelProvider>
          )}
        </div>
      </main>
    </div>
  )
}

export default MessagesWithAbly
