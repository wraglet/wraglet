'use client'

import { useState } from 'react'
import useUserStore from '@/store/user'
import { ChatRoomProvider } from '@ably/chat/react'
import { Bars3Icon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'

import type { IConversation } from '@/types/conversation'
import ChatWindow from '@/components/messages/ChatWindow'
import Contacts from '@/components/messages/Contacts'
import GroupChatHeader from '@/components/messages/GroupChatHeader'
import { NewChatModal } from '@/components/messages/NewChatModal'

const MessagesWithAbly = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [showContactsSidebar, setShowContactsSidebar] = useState(false)
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
        setShowContactsSidebar(false) // Close sidebar on mobile when chat is selected
      }
    } catch (e) {
      // Optionally show error
    }
  }

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedId(conversationId)
    setShowContactsSidebar(false) // Close sidebar on mobile when chat is selected
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
    <div className="flex h-full w-full grow overflow-hidden rounded-lg border bg-white pb-16 lg:pb-0">
      {/* Mobile overlay */}
      {showContactsSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setShowContactsSidebar(false)}
        />
      )}

      {/* Conversation List - Desktop always visible, Mobile as drawer */}
      <aside
        className={` ${showContactsSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed top-0 bottom-0 left-0 z-40 w-[320px] max-w-[85vw] flex-shrink-0 overflow-y-auto border-r bg-white p-4 transition-transform duration-300 ease-in-out lg:relative lg:w-[320px] lg:max-w-xs lg:translate-x-0`}
      >
        <div className="mt-14 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContactsSidebar(false)}
              className="rounded-full p-1 hover:bg-gray-100 lg:hidden"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-lg font-bold">Chats</span>
          </div>
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
        <Contacts
          conversations={conversations}
          selectedId={selectedId}
          setSelectedId={handleSelectConversation}
          refetchConversations={refetchConversations}
        />
      </aside>

      {/* Chat Window */}
      <main className="flex min-h-0 flex-1 flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Mobile chat header with back button */}
            <div className="relative border-b">
              <button
                onClick={() => setShowContactsSidebar(true)}
                className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full p-2 hover:bg-gray-100 lg:hidden"
              >
                <Bars3Icon className="h-5 w-5 text-gray-600" />
              </button>
              <GroupChatHeader
                participants={headerParticipants}
                isGroup={isGroup}
              />
            </div>

            {selectedId && (
              <div className="min-h-0 flex-1">
                <ChatRoomProvider name={selectedId}>
                  <ChatWindow conversationId={selectedId} />
                </ChatRoomProvider>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-gray-400">
            <button
              onClick={() => setShowContactsSidebar(true)}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 lg:hidden"
            >
              View Conversations
            </button>
            <div className="text-center">
              <p>Select a conversation to start chatting</p>
              <p className="mt-1 hidden text-sm lg:block">
                Choose a conversation from the sidebar
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default MessagesWithAbly
