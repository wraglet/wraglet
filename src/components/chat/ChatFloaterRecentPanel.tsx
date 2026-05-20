'use client'

import { getConversationFloaterDisplay } from '@/utils/conversationFloaterDisplay'
import { PlusIcon } from '@heroicons/react/24/outline'

import type { IConversation } from '@/types/conversation'
import { chatFloaterNewChatButtonClassName } from '@/components/chat/chatFloaterUi'
import FloaterConversationAvatarButton from '@/components/chat/FloaterConversationAvatarButton'

const RECENT_LIMIT = 8

interface ChatFloaterRecentPanelProps {
  conversations: IConversation[]
  minimizedIds: Set<string>
  currentUserId: string | undefined
  onOpenConversation: (conversationId: string) => void
  onAddChat: () => void
}

/** Expanded floater stack: recent threads (not already docked), then “+” new chat. */
const ChatFloaterRecentPanel = ({
  conversations,
  minimizedIds,
  currentUserId,
  onOpenConversation,
  onAddChat
}: ChatFloaterRecentPanelProps) => {
  const recentSlice = conversations
    .slice(0, RECENT_LIMIT)
    .filter((c) => !minimizedIds.has(c._id))

  return (
    <div className="flex flex-col items-end gap-2.5">
      {recentSlice.map((convo) => {
        const info = getConversationFloaterDisplay(convo, currentUserId)
        const initials = info.users
          .slice(0, 2)
          .map((u) => u?.firstName?.[0] ?? '?')
          .join('')

        return (
          <FloaterConversationAvatarButton
            key={convo._id}
            name={info.name}
            avatarUrl={info.avatar}
            gender={info.gender}
            isGroup={info.isGroup}
            groupInitials={initials}
            otherUserId={info.otherUserId}
            unreadCount={convo.unreadCount ?? 0}
            onOpen={() => onOpenConversation(convo._id)}
          />
        )
      })}
      <button
        type="button"
        title="New conversation"
        className={chatFloaterNewChatButtonClassName}
        onClick={onAddChat}
        aria-label="Start new chat"
      >
        <PlusIcon className="h-5 w-5" aria-hidden />
      </button>
    </div>
  )
}

export default ChatFloaterRecentPanel
