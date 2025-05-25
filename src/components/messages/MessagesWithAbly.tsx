'use client'

import { useEffect, useRef, useState } from 'react'
import useUserStore from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import { ChannelProvider, useAbly, useChannel } from 'ably/react'
import axios from 'axios'

import type { IConversation } from '@/types/conversation'
import Avatar from '@/components/Avatar'
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

const ChatWindow = ({
  selectedId,
  messages,
  setMessages,
  currentUser,
  messageInput,
  setMessageInput,
  sending,
  setSending,
  setError
}: {
  selectedId: string
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  currentUser: any
  messageInput: string
  setMessageInput: (v: string) => void
  sending: boolean
  setSending: (v: boolean) => void
  setError: (v: string | null) => void
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const ablyClient = useAbly()
  const channelRef = useRef<any>(null)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (ablyClient && selectedId) {
      channelRef.current = ablyClient.channels.get(`conversation-${selectedId}`)
    }
  }, [ablyClient, selectedId])

  // Real-time: listen for new messages and typing events in the selected conversation
  useChannel(`conversation-${selectedId}`, (msg) => {
    if (msg.name === 'message') {
      setMessages((prev: Message[]) => [...prev, msg.data])
    } else if (msg.name === 'typing' && msg.data.userId !== currentUser?._id) {
      setIsTyping(true)
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => setIsTyping(false), 1500)
    }
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Typing event
  const handleTyping = () => {
    if (channelRef.current) {
      channelRef.current.publish('typing', { userId: currentUser?._id })
    }
  }

  // Send a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedId) return
    setSending(true)
    try {
      // Send to API
      const res = await axios.post('/api/messages', {
        conversationId: selectedId,
        content: messageInput
      })
      // Do NOT update state here; rely on Ably event for real-time update
      // Publish to Ably for real-time delivery, ensure full sender info is included
      if (channelRef.current) {
        channelRef.current.publish('message', res.data.data)
      }
      setMessageInput('')
    } catch {
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="px-3 py-2 text-gray-400">No messages yet</div>
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => {
              const isCurrentUser = m.sender?._id === currentUser?._id
              return (
                <li
                  key={m._id}
                  className={`flex items-start gap-3 px-3 py-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar
                    src={
                      m.sender?.profilePicture?.url ||
                      m.sender?.profilePicture ||
                      null
                    }
                    gender={m.sender?.gender}
                    alt={m.sender?.firstName}
                    className="h-8 w-8"
                  />
                  <div
                    className={`max-w-[70%] ${isCurrentUser ? 'ml-2 rounded-tl-lg rounded-tr-lg rounded-br-none rounded-bl-lg bg-blue-100 text-right' : 'mr-2 rounded-tl-lg rounded-tr-lg rounded-br-lg rounded-bl-none bg-gray-100 text-left'} px-4 py-2`}
                  >
                    <div className="text-xs font-semibold text-gray-800">
                      {m.sender?.firstName} {m.sender?.lastName}
                      {m.sender?.username && (
                        <span className="ml-1 text-gray-400">
                          {m.sender.username}
                        </span>
                      )}
                      <span className="ml-2 font-normal text-gray-400">
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>{m.content}</div>
                  </div>
                </li>
              )
            })}
            {isTyping && (
              <li className="px-3 py-2 text-xs text-gray-400">Typing...</li>
            )}
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>
      <div className="border-t bg-white p-2">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            className="flex-1 rounded border px-3 py-2"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value)
              handleTyping()
            }}
            disabled={!selectedId || sending}
          />
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
            disabled={!selectedId || sending || !messageInput.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

const MessagesWithAbly = ({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status
}: Omit<MessagesWithAblyProps, 'conversations'>) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
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

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedId) return
    setLoadingMessages(true)
    axios
      .get('/api/messages', { headers: { 'x-conversation-id': selectedId } })
      .then((res) => {
        setMessages(res.data.data || [])
        setLoadingMessages(false)
      })
      .catch(() => {
        setError('Could not load messages')
        setLoadingMessages(false)
      })
  }, [selectedId])

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
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-bold">Conversations</span>
          <button
            className="rounded bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600"
            onClick={() => setShowNewChat(true)}
          >
            + New Chat
          </button>
        </div>
        <NewChatModal
          open={showNewChat}
          onClose={() => setShowNewChat(false)}
          users={[]}
          isLoading={false}
          error={null}
          onSelectUser={async (user: any) => {
            setShowNewChat(false)
            // Call API to create/get conversation
            try {
              const res = await axios.post('/api/conversations', {
                participantIds: [user._id]
              })
              const convo = res.data.data
              if (
                conversations &&
                !conversations.some((c) => c._id === convo._id)
              ) {
                conversations.unshift(convo)
              }
              setSelectedId(convo._id)
            } catch (e) {
              alert('Failed to start chat')
            }
          }}
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
      <main className="flex min-w-0 flex-1 flex-col bg-[#eaf7ff]">
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
              {loadingMessages ? (
                <div className="text-gray-400">Loading messages...</div>
              ) : error ? (
                <div className="text-red-400">{error}</div>
              ) : (
                <ChatWindow
                  selectedId={selectedId}
                  messages={messages}
                  setMessages={setMessages}
                  currentUser={currentUser}
                  messageInput={messageInput}
                  setMessageInput={setMessageInput}
                  sending={sending}
                  setSending={setSending}
                  setError={setError}
                />
              )}
            </ChannelProvider>
          )}
        </div>
      </main>
    </div>
  )
}

export default MessagesWithAbly
