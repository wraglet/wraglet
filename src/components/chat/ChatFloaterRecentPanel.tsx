'use client'

import { getConversationFloaterDisplay } from '@/utils/conversationFloaterDisplay'
import { PlusIcon } from '@heroicons/react/24/outline'

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
    <div className="flex flex-col items-end gap-2.5">
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
        title="New conversation"
        className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sky-200/70 bg-gradient-to-br from-white via-white to-sky-50/90 text-sky-600 shadow-[0_6px_20px_-6px_rgba(14,165,233,0.45)] ring-2 ring-white/90 transition hover:scale-105 hover:from-sky-500 hover:via-sky-500 hover:to-sky-600 hover:text-white hover:shadow-lg hover:ring-sky-300/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 active:scale-95"
        onClick={onAddChat}
        aria-label="Start new chat"
      >
        <PlusIcon className="h-5 w-5" aria-hidden />
      </button>
    </div>
  )
}

export default ChatFloaterRecentPanel
