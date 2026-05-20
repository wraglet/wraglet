'use client'

import { getConversationFloaterDisplay } from '@/utils/conversationFloaterDisplay'

import type { IConversation } from '@/types/conversation'
import { minimizedFloaterStackClassName } from '@/components/chat/chatFloaterUi'
import FloaterConversationAvatarButton from '@/components/chat/FloaterConversationAvatarButton'

interface MinimizedFloaterStackProps {
  conversations: IConversation[]
  minimizedChats: { conversationId: string }[]
  currentUserId: string | undefined
  onOpenConversation: (conversationId: string) => void
}

/** Docked conversation avatars — always visible above the main chat FAB. */
const MinimizedFloaterStack = ({
  conversations,
  minimizedChats,
  currentUserId,
  onOpenConversation
}: MinimizedFloaterStackProps) => {
  if (minimizedChats.length === 0) return null

  const byId = new Map(conversations.map((c) => [c._id, c]))

  return (
    <div className={minimizedFloaterStackClassName}>
      {minimizedChats.map(({ conversationId }) => {
        const convo = byId.get(conversationId)
        if (!convo) return null
        const info = getConversationFloaterDisplay(convo, currentUserId)
        const initials = info.users
          .slice(0, 2)
          .map((u) => u?.firstName?.[0] ?? '?')
          .join('')

        return (
          <FloaterConversationAvatarButton
            key={conversationId}
            name={info.name}
            avatarUrl={info.avatar}
            gender={info.gender}
            isGroup={info.isGroup}
            groupInitials={initials}
            otherUserId={info.otherUserId}
            unreadCount={convo.unreadCount ?? 0}
            onOpen={() => onOpenConversation(conversationId)}
          />
        )
      })}
    </div>
  )
}

export default MinimizedFloaterStack
