import { useEffect, useRef, useState } from 'react'
import type { IUser } from '@/models/User'
import useUserStore from '@/store/user'
import { type ChatMessageEvent, type Message } from '@ably/chat'
import {
  useMessages,
  usePresence,
  usePresenceListener,
  useRoom,
  useTyping
} from '@ably/chat/react'
import axios from 'axios'

import Avatar from '@/components/Avatar'

const ChatWindow = ({ conversationId }: { conversationId: string }) => {
  const { user: currentUser } = useUserStore()
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { room } = useRoom()
  const isRoomAttached = room?.status === 'attached'

  usePresence({
    enterWithData: currentUser
      ? {
          _id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          profilePicture: currentUser.profilePicture,
          gender: currentUser.gender
        }
      : undefined
  })

  const { presenceData } = usePresenceListener()

  const { send: sendMessage } = useMessages({
    listener: (messageEvent: ChatMessageEvent) => {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.find(
          (msg) => msg.serial === messageEvent.message.serial
        )

        if (messageExists) {
          return prevMessages.map((msg) =>
            msg.serial === messageEvent.message.serial
              ? messageEvent.message
              : msg
          )
        } else {
          return [...prevMessages, messageEvent.message]
        }
      })
    }
  })

  const { keystroke, currentlyTyping } = useTyping()

  useEffect(() => {
    if (!conversationId) return
    setMessages([])
    axios
      .get(`/api/messages`, {
        headers: { 'x-conversation-id': conversationId }
      })
      .then((res) => {
        const historicalMessages = res.data.data.map(
          (m: any): Partial<Message> => ({
            serial: m.id || m._id,
            clientId: m.sender?._id || m.sender,
            text: m.content,
            timestamp: new Date(m.createdAt || m.timestamp),
            metadata: {
              ...(m.extras || {}),
              sender: m.sender
            }
          })
        )
        setMessages(historicalMessages as Message[])
      })
  }, [conversationId])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !isRoomAttached) return

    const messageText = messageInput
    setMessageInput('') // Clear input immediately for responsiveness

    try {
      // Send the message via Ably for real-time experience
      // This will also optimistically update the sender's UI via the listener
      await sendMessage({ text: messageText })

      // Persist the message to the database
      await axios.post('/api/messages', {
        content: messageText,
        conversationId: conversationId
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      // If sending fails, restore the input so the user can retry.
      setMessageInput(messageText)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)
    if (isRoomAttached) {
      keystroke()
    }
  }

  const typingClientIds = Array.from(currentlyTyping).filter(
    (clientId) => clientId !== currentUser?._id
  )

  const typingUsers = typingClientIds
    .map((clientId) => {
      const member = presenceData.find((m) => m.clientId === clientId)
      const data = member?.data as any
      return data?.firstName
    })
    .filter(Boolean)

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="px-3 py-2 text-gray-400">No messages yet</div>
        ) : (
          <>
            <ul className="space-y-2 px-3 py-2">
              {messages.map((m) => {
                if (!m) return null
                const isCurrentUser = m.clientId === currentUser?._id

                let sender = m.metadata?.sender as any
                if (!sender) {
                  const member = presenceData.find(
                    (p) => p.clientId === m.clientId
                  )
                  if (member) {
                    sender = member.data
                  }
                }

                const senderProfile = sender as Partial<IUser> | undefined

                return (
                  <li
                    key={m.serial}
                    className={`flex gap-2 px-3 py-1 ${
                      isCurrentUser ? 'flex-row-reverse items-end' : 'items-end'
                    }`}
                  >
                    {!isCurrentUser && (
                      <Avatar
                        src={
                          typeof senderProfile?.profilePicture === 'object'
                            ? senderProfile.profilePicture.url
                            : senderProfile?.profilePicture || null
                        }
                        gender={senderProfile?.gender}
                        alt={senderProfile?.firstName}
                        className="h-7 w-7"
                      />
                    )}
                    <div
                      className={`flex max-w-[75%] flex-col ${
                        isCurrentUser
                          ? 'items-end self-end'
                          : 'items-start self-start'
                      }`}
                    >
                      <div
                        className={`px-4 py-2 text-sm break-words shadow-sm ${
                          isCurrentUser
                            ? 'self-end rounded-2xl rounded-br-none bg-blue-500 text-white'
                            : 'self-start rounded-2xl rounded-bl-none bg-gray-100 text-gray-900'
                        }`}
                      >
                        {!isCurrentUser && (
                          <div className="mb-0.5 text-xs font-semibold text-gray-700">
                            {senderProfile?.firstName} {senderProfile?.lastName}
                          </div>
                        )}
                        {m.text}
                      </div>
                      <span className="mt-1 text-xs text-gray-400">
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </li>
                )
              })}
              {typingUsers.length > 0 && (
                <li className="px-3 py-2 text-xs text-gray-400">
                  {typingUsers.join(', ')} is typing...
                </li>
              )}
            </ul>
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <div className="mt-auto border-t bg-white p-2">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            className="flex-1 rounded-2xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Type a message..."
            value={messageInput}
            onChange={handleTyping}
            disabled={!conversationId}
          />
          <button
            type="submit"
            className="rounded-2xl bg-blue-500 px-4 py-2 font-semibold text-white shadow hover:bg-blue-600 disabled:opacity-50"
            disabled={!conversationId || !messageInput.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
