import type { IConversation } from '@/types/conversation'

export const participantAvatarUrl = (user: any): string | null => {
  if (!user?.profilePicture) return null
  const pic = user.profilePicture
  if (typeof pic === 'string' && pic.trim()) return pic.trim()
  if (typeof pic === 'object' && pic !== null && typeof pic.url === 'string') {
    const u = pic.url.trim()
    return u.length > 0 ? u : null
  }
  return null
}

export const getConversationFloaterDisplay = (
  convo: IConversation | null | undefined,
  currentUserId: string | undefined
) => {
  if (!convo) {
    return {
      name: '',
      avatar: null as string | null,
      isGroup: false,
      users: [] as any[],
      gender: '',
      otherUserId: undefined as string | undefined
    }
  }
  let displayUsers = convo.participants as any[]
  if (!convo.isGroup && currentUserId) {
    displayUsers = displayUsers.filter((p: any) => p._id !== currentUserId)
  }
  const other = displayUsers[0]
  return {
    name: convo.isGroup
      ? convo.name ||
        displayUsers.map((u: any) => `${u.firstName} ${u.lastName}`).join(', ')
      : `${other?.firstName ?? ''} ${other?.lastName ?? ''}`.trim(),
    avatar: convo.isGroup ? null : participantAvatarUrl(other),
    isGroup: !!convo.isGroup,
    users: displayUsers,
    gender: convo.isGroup ? '' : other?.gender || '',
    otherUserId: convo.isGroup ? undefined : other?._id
  }
}
