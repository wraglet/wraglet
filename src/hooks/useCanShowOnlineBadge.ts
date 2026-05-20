import useOnlinePresenceStore from '@/store/onlinePresence'
import useUserStore from '@/store/user'

export const useCanShowOnlineBadge = (userId: string | undefined): boolean => {
  const currentUserId = useUserStore((state) => state.user?._id)
  const onlineUserIds = useOnlinePresenceStore((state) => state.onlineUserIds)
  const mutualUserIds = useOnlinePresenceStore((state) => state.mutualUserIds)
  const conversationUserIds = useOnlinePresenceStore(
    (state) => state.conversationUserIds
  )

  if (!userId || !currentUserId || userId === currentUserId) return false
  if (!onlineUserIds.has(userId)) return false
  return mutualUserIds.has(userId) || conversationUserIds.has(userId)
}
