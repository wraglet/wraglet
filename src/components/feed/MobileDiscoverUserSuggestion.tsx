'use client'

import Link from 'next/link'
import type { UserInterface } from '@/interfaces'
import { useFollow } from '@/lib/hooks/useFollow'
import { profileHrefFromUsername } from '@/lib/profileHref'

import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

export type MobileDiscoverUserSuggestionUser = UserInterface & {
  isTrending?: boolean
  isRecentActive?: boolean
  isNew?: boolean
}

interface MobileDiscoverUserSuggestionProps {
  user: MobileDiscoverUserSuggestionUser
  onProfileNavigate?: () => void
}

const MobileDiscoverUserSuggestion = ({
  user,
  onProfileNavigate
}: MobileDiscoverUserSuggestionProps) => {
  const { isFollowing, follow, loading } = useFollow(user._id)
  const profileHref =
    profileHrefFromUsername(user.username) ?? `/${user.username}`

  const handleFollow = async () => {
    await follow(undefined)
  }

  let followLabel = 'Follow'
  if (isFollowing) followLabel = 'Following'
  else if (loading) followLabel = 'Following...'

  return (
    <div className="flex items-center gap-3">
      <Link
        href={profileHref}
        onClick={() => onProfileNavigate?.()}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg transition-colors outline-none hover:bg-sky-50/70 focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/30"
      >
        <div className="relative shrink-0">
          <Avatar
            gender={user.gender}
            size="h-11 w-11"
            alt={user.username}
            src={user.profilePicture?.url || null}
          />
          {user.isTrending && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500">
              <span className="text-xs text-white">🔥</span>
            </div>
          )}
          {user.isRecentActive && !user.isTrending && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
              <span className="text-xs text-white">⚡</span>
            </div>
          )}
          {user.isNew && !user.isTrending && !user.isRecentActive && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0EA5E9]">
              <span className="text-xs text-white">🆕</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            {user.isTrending && (
              <span className="rounded bg-orange-100 px-1 text-xs text-orange-600">
                Trending
              </span>
            )}
          </div>
          <p className="truncate text-xs text-gray-500">{user.username}</p>
        </div>
      </Link>
      <Button
        type="button"
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          isFollowing
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-sky-100 text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white'
        } disabled:opacity-50`}
        onClick={handleFollow}
        disabled={loading}
      >
        {followLabel}
      </Button>
    </div>
  )
}

export default MobileDiscoverUserSuggestion
