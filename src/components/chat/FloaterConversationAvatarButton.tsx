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
      <span className="relative inline-flex rounded-full shadow-[0_6px_18px_-6px_rgba(14,165,233,0.35)] ring-2 ring-white transition group-hover:ring-sky-300/80">
        {isGroup ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-100/80 bg-gradient-to-br from-sky-50 to-slate-100 text-xs font-bold text-sky-800">
            {groupInitials}
          </div>
        ) : (
          <Avatar
            gender={avatarGender}
            src={avatarUrl}
            alt={name}
            className="!border-0"
            size="h-10 w-10"
          />
        )}
        {badge !== null && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-rose-500 to-red-600 px-1 text-[10px] font-bold text-white tabular-nums shadow-sm">
            {badge}
          </span>
        )}
      </span>
      <span className="pointer-events-none absolute top-[3.25rem] left-1/2 z-10 -translate-x-1/2 rounded-lg bg-gray-900/95 px-2.5 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover:opacity-100">
        {name || 'Chat'}
      </span>
    </button>
  )
}

export default FloaterConversationAvatarButton
