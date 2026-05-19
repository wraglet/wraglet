import type { Gender } from '@/interfaces'

import Avatar from '@/components/shared/Avatar'

interface Message {
  _id: string
  sender: {
    _id: string
    firstName: string
    lastName: string
    gender: Gender
    profilePicture?: {
      url?: string | null
    } | null
  }
  content: string
  createdAt: string
}

interface MessageBodyProps {
  messages: Message[]
  selectedId: string | null
  currentUserId?: string
}

const renderConversationMessages = (
  messages: Message[],
  currentUserId?: string
) => {
  if (messages.length === 0) {
    return <div className="px-3 py-2 text-gray-400">No messages yet</div>
  }

  return (
    <ul className="space-y-2 px-3 py-2">
      {messages.map((message) => {
        const isCurrentUser = message.sender._id === currentUserId

        return (
          <li
            key={message._id}
            className={`flex gap-2 px-3 py-1 ${
              isCurrentUser ? 'flex-row-reverse items-end' : 'items-end'
            }`}
          >
            {!isCurrentUser && (
              <Avatar
                src={message.sender.profilePicture?.url || null}
                gender={message.sender.gender}
                alt={message.sender.firstName}
                className="h-7 w-7"
              />
            )}
            <div
              className={`flex max-w-[75%] flex-col ${
                isCurrentUser ? 'items-end self-end' : 'items-start self-start'
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
                    {message.sender.firstName} {message.sender.lastName}
                  </div>
                )}
                {message.content}
              </div>
              <span className="mt-1 text-xs text-gray-400">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

const MessageBody = ({
  messages,
  selectedId,
  currentUserId
}: MessageBodyProps) => {
  const renderMessageArea = () => {
    if (!selectedId) {
      return (
        <div className="flex h-full items-center justify-center text-gray-400">
          Select a conversation to start chatting
        </div>
      )
    }

    return renderConversationMessages(messages, currentUserId)
  }

  return (
    <section className="flex h-full w-full flex-1 flex-col bg-white">
      <div className="flex-1 overflow-y-auto">{renderMessageArea()}</div>
      {selectedId && (
        <div className="mt-auto border-t bg-white p-2">
          <form className="flex items-center gap-2">
            <input
              className="flex-1 rounded-2xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Type a message..."
              disabled
            />
            <button
              type="submit"
              className="rounded-2xl bg-blue-500 px-4 py-2 font-semibold text-white shadow hover:bg-blue-600 disabled:opacity-50"
              disabled
            >
              Send
            </button>
          </form>
        </div>
      )}
    </section>
  )
}

export default MessageBody
