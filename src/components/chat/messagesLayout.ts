import { cn } from '@/lib/utils'

import type { IConversation } from '@/types/conversation'

export const getConversationHeaderParticipants = (
  conversation: IConversation | null,
  currentUserId: string | undefined
): { participants: IConversation['participants']; isGroup: boolean } => {
  if (!conversation) {
    return { participants: [], isGroup: false }
  }

  const isGroup = conversation.isGroup
  if (!isGroup && currentUserId) {
    return {
      participants: conversation.participants.filter(
        (participant) => participant._id !== currentUserId
      ),
      isGroup
    }
  }

  return { participants: conversation.participants, isGroup }
}

const messagesAsideBaseClassName =
  'flex h-full min-h-0 flex-shrink-0 flex-col overflow-hidden border-r border-neutral-200 bg-white lg:w-[320px] lg:max-w-xs'

const messagesAsideMobileListClassName =
  'max-lg:relative max-lg:z-auto max-lg:h-full max-lg:w-full max-lg:max-w-full max-lg:translate-x-0'

const messagesAsideDrawerClassName =
  'p-4 max-lg:fixed max-lg:top-14 max-lg:left-0 max-lg:z-40 max-lg:w-[320px] max-lg:max-w-[85vw] max-lg:overflow-y-auto max-lg:shadow-xl max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out max-lg:bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] sm:max-lg:bottom-[calc(4rem+env(safe-area-inset-bottom,0px))]'

export const getMessagesAsideClassName = ({
  showMobileConversationList,
  showContactsSidebar,
  selectedId
}: {
  showMobileConversationList: boolean
  showContactsSidebar: boolean
  selectedId: string | null
}) => {
  if (showMobileConversationList) {
    return cn(
      messagesAsideBaseClassName,
      messagesAsideMobileListClassName,
      'p-4'
    )
  }

  const drawerVisibility = showContactsSidebar
    ? 'translate-x-0'
    : '-translate-x-full lg:translate-x-0'

  return cn(
    messagesAsideBaseClassName,
    messagesAsideDrawerClassName,
    drawerVisibility,
    selectedId && 'max-lg:hidden'
  )
}
