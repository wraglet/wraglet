import { useEffect, useRef, useState } from 'react'
import useUserStore from '@/store/user'
import { useAbly, useChannel } from 'ably/react'
import axios from 'axios'

import Avatar from '@/components/Avatar'

interface Message {
  _id: string
  sender: any
  content: string
  createdAt: string
}

const ChatWindow = ({ conversationId }: { conversationId: string }) => {
  const { user: currentUser } = useUserStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const ablyClient = useAbly()
  const channelRef = useRef<any>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingName, setTypingName] = useState<string | null>(null)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!conversationId) return
    setMessages([])
    setError(null)
    setMessageInput('')
    setSending(false)
    // Fetch messages for this conversation
    axios
      .get('/api/messages', {
        headers: { 'x-conversation-id': conversationId }
      })
      .then((res) => setMessages(res.data.data || []))
      .catch(() => setError('Could not load messages'))
  }, [conversationId])

  useEffect(() => {
    if (ablyClient && conversationId) {
      channelRef.current = ablyClient.channels.get(
        `conversation-${conversationId}`
      )
    }
  }, [ablyClient, conversationId])

  useChannel(`conversation-${conversationId}`, (msg) => {
    if (msg.name === 'message') {
      setMessages((prev: Message[]) => [...prev, msg.data])
    } else if (msg.name === 'typing' && msg.data.userId !== currentUser?._id) {
      setTypingName(msg.data.name || 'Someone')
      setIsTyping(true)
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => setIsTyping(false), 1500)
    }
  })

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleTyping = () => {
    if (channelRef.current) {
      channelRef.current.publish('typing', {
        userId: currentUser?._id,
        name: `${currentUser?.firstName} ${currentUser?.lastName}`
      })
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !conversationId) return
    setSending(true)
    try {
      const res = await axios.post('/api/messages', {
        conversationId,
        content: messageInput
      })
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
      <div className="flex-1 overflow-y-auto bg-white">
        {messages.length === 0 ? (
          <div className="px-3 py-2 text-gray-400">No messages yet</div>
        ) : (
          <ul className="space-y-2">
            {messages.map((m, idx) => {
              const isCurrentUser = m.sender?._id === currentUser?._id
              return (
                <li
                  key={m._id}
                  className={`flex gap-2 px-3 py-1 ${isCurrentUser ? 'flex-row-reverse items-end' : 'items-end'}`}
                >
                  {!isCurrentUser && (
                    <Avatar
                      src={
                        m.sender?.profilePicture?.url ||
                        m.sender?.profilePicture ||
                        null
                      }
                      gender={m.sender?.gender}
                      alt={m.sender?.firstName}
                      className="h-7 w-7"
                    />
                  )}
                  <div
                    className={`flex max-w-[75%] flex-col ${isCurrentUser ? 'items-end self-end' : 'items-start self-start'}`}
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
                          {m.sender?.firstName} {m.sender?.lastName}
                        </div>
                      )}
                      {m.content}
                    </div>
                    <span className="mt-1 text-xs text-gray-400">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </li>
              )
            })}
            {isTyping && (
              <li className="px-3 py-2 text-xs text-gray-400">
                {typingName ? `${typingName} is typing...` : 'Typing...'}
              </li>
            )}
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>
      <div className="border-t bg-white p-2">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            className="flex-1 rounded-2xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value)
              handleTyping()
            }}
            disabled={!conversationId || sending}
          />
          <button
            type="submit"
            className="rounded-2xl bg-blue-500 px-4 py-2 font-semibold text-white shadow hover:bg-blue-600 disabled:opacity-50"
            disabled={!conversationId || sending || !messageInput.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
