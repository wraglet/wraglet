'use client'

import type { Gender } from '@/interfaces'
import { DEFAULT_GENDER } from '@/data/constants'
import Avatar from '@/components/shared/Avatar'

interface FloaterConversationAvatarButtonProps {
  name: string
  avatarUrl: string | null
  gender: string
  isGroup: boolean
  groupInitials: string
  unreadCount: number
  onOpen: () => void
}

const FloaterConversationAvatarButton = ({
  name,
  avatarUrl,
  gender,
  isGroup,
  groupInitials,
  unreadCount,
  onOpen
}: FloaterConversationAvatarButtonProps) => {
  let badge: string | null = null
  if (unreadCount > 0) {
    badge = unreadCount > 99 ? '99+' : String(unreadCount)
  }

  const avatarGender = (gender || DEFAULT_GENDER) as Gender

  return (
    <button
      type="button"
      className="group relative flex flex-col items-center"
      onClick={onOpen}
      aria-label={name ? `Open chat with ${name}` : 'Open chat'}
    >
      <span className="relative inline-flex">
        {isGroup ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-gray-200 text-xs font-bold">
            {groupInitials}
          </div>
        ) : (
          <Avatar
            gender={avatarGender}
            src={avatarUrl}
            alt={name}
            className="h-10 w-10"
          />
        )}
        {badge !== null && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
            {badge}
          </span>
        )}
      </span>
      <span className="pointer-events-none absolute top-12 left-1/2 z-10 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg group-hover:opacity-100">
        {name || 'Chat'}
      </span>
    </button>
  )
}

export default FloaterConversationAvatarButton
