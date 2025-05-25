import { useEffect, useState } from 'react'
import useUserStore from '@/store/user'
import { ChannelProvider, useChannel } from 'ably/react'

import Avatar from '@/components/Avatar'

interface Conversation {
  _id: string
  name?: string
  isGroup: boolean
  participants: any[]
  lastMessage?: any
  unreadCount?: number
}

const CollageAvatar = ({ users }: { users: any[] }) => {
  const avatars = users.slice(0, 3)
  return (
    <div className="relative h-10 w-10">
      {avatars.map((user, i) => (
        <div
          key={user._id}
          className={`absolute rounded-full border-2 border-white bg-white ${
            i === 0
              ? 'top-0 left-0 z-30'
              : i === 1
                ? 'top-0 left-5 z-20'
                : 'top-5 left-2 z-10'
          }`}
          style={{ width: 28, height: 28 }}
        >
          <Avatar
            src={user.profilePicture || user.profilePicture?.url || null}
            gender={user.gender}
            alt={user.firstName}
            className="h-7 w-7"
          />
        </div>
      ))}
      {users.length > 3 && (
        <span className="absolute -right-2 -bottom-2 z-40 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white shadow">
          +{users.length - 3}
        </span>
      )}
    </div>
  )
}

// Child component to subscribe to a conversation channel
const ConversationChannelListener = ({
  convoId,
  selectedId,
  setLocalConvos,
  setHighlighted
}: {
  convoId: string
  selectedId: string | null
  setLocalConvos: React.Dispatch<React.SetStateAction<Conversation[]>>
  setHighlighted: React.Dispatch<
    React.SetStateAction<{ [id: string]: boolean }>
  >
}) => {
  useChannel(`conversation-${convoId}`, (msg) => {
    if (msg.name === 'message') {
      setLocalConvos((prev) =>
        prev.map((convo) =>
          convo._id === convoId
            ? {
                ...convo,
                lastMessage: msg.data,
                unreadCount:
                  selectedId === convoId ? 0 : (convo.unreadCount || 0) + 1
              }
            : convo
        )
      )
      if (selectedId !== convoId) {
        setHighlighted((prev) => ({ ...prev, [convoId]: true }))
        setTimeout(() => {
          setHighlighted((prev) => ({ ...prev, [convoId]: false }))
        }, 1200)
      }
    }
  })
  return null
}

const Contacts = ({
  conversations,
  selectedId,
  setSelectedId,
  refetchConversations
}: {
  conversations: Conversation[]
  selectedId: string | null
  setSelectedId: (id: string) => void
  refetchConversations: () => void
}) => {
  const { user: currentUser } = useUserStore()
  const [highlighted, setHighlighted] = useState<{ [id: string]: boolean }>({})
  const [localConvos, setLocalConvos] = useState<Conversation[]>(conversations)

  useEffect(() => {
    setLocalConvos(conversations)
  }, [conversations])

  // Render a ConversationChannelListener for each conversation (up to 10)
  localConvos.slice(0, 10).forEach((c) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ;<ConversationChannelListener
      key={c._id}
      convoId={c._id}
      selectedId={selectedId}
      setLocalConvos={setLocalConvos}
      setHighlighted={setHighlighted}
    />
  })

  return (
    <aside className="max-w-xs flex-shrink-0 overflow-y-auto bg-white">
      {localConvos.length === 0 ? (
        <div className="text-gray-400">No conversations</div>
      ) : (
        <ul className="space-y-1">
          {/* Render listeners for real-time updates, each in its own ChannelProvider */}
          {localConvos.slice(0, 10).map((c) => (
            <ChannelProvider key={c._id} channelName={`conversation-${c._id}`}>
              <ConversationChannelListener
                convoId={c._id}
                selectedId={selectedId}
                setLocalConvos={setLocalConvos}
                setHighlighted={setHighlighted}
              />
            </ChannelProvider>
          ))}
          {localConvos.map((c) => {
            let displayUsers = c.participants
            if (!c.isGroup && currentUser?._id) {
              displayUsers = c.participants.filter(
                (p: any) => p._id !== currentUser._id
              )
            }
            const lastMsg = c.lastMessage
            return (
              <li key={c._id}>
                <button
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-blue-50 ${selectedId === c._id ? 'bg-blue-100 font-bold' : ''} ${highlighted[c._id] ? 'bg-blue-200 ring-2 ring-blue-400' : ''} mr-2`}
                  onClick={() => setSelectedId(c._id)}
                >
                  {c.isGroup ? (
                    <CollageAvatar users={displayUsers} />
                  ) : (
                    <Avatar
                      src={
                        displayUsers[0]?.profilePicture?.url ||
                        displayUsers[0]?.profilePicture ||
                        null
                      }
                      gender={displayUsers[0]?.gender}
                      alt={displayUsers[0]?.firstName}
                      className="h-10 w-10"
                    />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold text-gray-900">
                      {c.isGroup
                        ? displayUsers
                            .map((u: any) => `${u.firstName} ${u.lastName}`)
                            .join(', ')
                        : `${displayUsers[0]?.firstName} ${displayUsers[0]?.lastName}`}
                    </span>
                    {lastMsg && (
                      <span className="truncate text-xs text-gray-500">
                        {lastMsg.sender?._id === currentUser?._id
                          ? 'You: '
                          : ''}
                        {lastMsg.content}
                      </span>
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
                    {c.unreadCount ? (
                      <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                        {c.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}

export default Contacts
