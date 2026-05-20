import { create } from 'zustand'

interface OnlinePresenceStore {
  onlineUserIds: Set<string>
  mutualUserIds: Set<string>
  conversationUserIds: Set<string>
  setOnlineUserIds: (ids: Set<string>) => void
  setMutualUserIds: (ids: Set<string>) => void
  setConversationUserIds: (ids: Set<string>) => void
  shouldShowOnlineBadge: (
    userId: string | undefined,
    currentUserId: string | undefined
  ) => boolean
}

export const shouldShowOnlineBadgeForUser = ({
  userId,
  currentUserId,
  onlineUserIds,
  mutualUserIds,
  conversationUserIds
}: {
  userId: string | undefined
  currentUserId: string | undefined
  onlineUserIds: Set<string>
  mutualUserIds: Set<string>
  conversationUserIds: Set<string>
}): boolean => {
  if (!userId || !currentUserId || userId === currentUserId) return false
  if (!onlineUserIds.has(userId)) return false
  return mutualUserIds.has(userId) || conversationUserIds.has(userId)
}

const useOnlinePresenceStore = create<OnlinePresenceStore>((set, get) => ({
  onlineUserIds: new Set(),
  mutualUserIds: new Set(),
  conversationUserIds: new Set(),
  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),
  setMutualUserIds: (ids) => set({ mutualUserIds: ids }),
  setConversationUserIds: (ids) => set({ conversationUserIds: ids }),
  shouldShowOnlineBadge: (userId, currentUserId) => {
    const state = get()
    return shouldShowOnlineBadgeForUser({
      userId,
      currentUserId,
      onlineUserIds: state.onlineUserIds,
      mutualUserIds: state.mutualUserIds,
      conversationUserIds: state.conversationUserIds
    })
  }
}))

export default useOnlinePresenceStore
