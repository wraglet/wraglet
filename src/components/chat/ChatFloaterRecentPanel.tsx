'use client'

import { getConversationFloaterDisplay } from '@/utils/conversationFloaterDisplay'

import type { IConversation } from '@/types/conversation'
import FloaterConversationAvatarButton from '@/components/chat/FloaterConversationAvatarButton'

const RECENT_LIMIT = 8

interface MinimizedEntry {
  conversationId: string
}

interface ChatFloaterRecentPanelProps {
  conversations: IConversation[]
  minimizedChats: MinimizedEntry[]
  currentUserId: string | undefined
  onOpenConversation: (conversationId: string) => void
  onAddChat: () => void
}

/**
 * Expanded floater stack: recent threads (by API order), then minimized-only threads, then "+" new chat.
 */
const ChatFloaterRecentPanel = ({
  conversations,
  minimizedChats,
  currentUserId,
  onOpenConversation,
  onAddChat
}: ChatFloaterRecentPanelProps) => {
  const byId = new Map(conversations.map((c) => [c._id, c]))
  const recentSlice = conversations.slice(0, RECENT_LIMIT)
  const recentIds = new Set(recentSlice.map((c) => c._id))

  const minimizedOnly = minimizedChats
    .map((m) => m.conversationId)
    .filter((id) => !recentIds.has(id))

  const orderedIds: string[] = [
    ...recentSlice.map((c) => c._id),
    ...minimizedOnly
  ]

  return (
    <div className="fixed right-8 bottom-36 z-50 flex flex-col items-center gap-2 lg:bottom-24">
      {orderedIds.map((id) => {
        const convo = byId.get(id)
        if (!convo) return null
        const info = getConversationFloaterDisplay(convo, currentUserId)
        const initials = info.users
          .slice(0, 2)
          .map((u: any) => u?.firstName?.[0] ?? '?')
          .join('')

        return (
          <FloaterConversationAvatarButton
            key={id}
            name={info.name}
            avatarUrl={info.avatar}
            gender={info.gender}
            isGroup={info.isGroup}
            groupInitials={initials}
            unreadCount={convo.unreadCount ?? 0}
            onOpen={() => onOpenConversation(id)}
          />
        )
      })}
      <button
        type="button"
        className="mt-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-2xl text-white shadow hover:bg-blue-600"
        onClick={onAddChat}
        aria-label="Start new chat"
      >
        +
      </button>
    </div>
  )
}

export default ChatFloaterRecentPanel
