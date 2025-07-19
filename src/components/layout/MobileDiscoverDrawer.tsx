'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { UserInterface } from '@/interfaces'
import { useFollow } from '@/lib/hooks/useFollow'
import { IoClose, IoPersonAddSharp } from 'react-icons/io5'

import Avatar from '@/components/shared/Avatar'

interface MobileDiscoverDrawerProps {
  isOpen: boolean
  onClose: () => void
  otherUsers: UserInterface[]
}

const UserSuggestion = ({
  user
}: {
  user: UserInterface & {
    isTrending?: boolean
    isRecentActive?: boolean
    isNew?: boolean
  }
}) => {
  const { isFollowing, follow, loading } = useFollow(user._id)

  return (
    <div className="group relative flex items-center justify-between rounded-lg p-3 transition-all duration-200 hover:bg-sky-50/50">
      <div className="flex w-full items-center gap-3">
        <div className="relative">
          <Avatar
            gender={user.gender}
            className="h-12 w-12 ring-2 ring-white"
            alt={`${user.firstName}'s Profile`}
            src={user.profilePicture?.url!}
          />
          {/* Badge for trending users */}
          {user.isTrending && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500">
              <span className="text-xs text-white">🔥</span>
            </div>
          )}
          {/* Badge for recent active users */}
          {user.isRecentActive && !user.isTrending && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
              <span className="text-xs text-white">⚡</span>
            </div>
          )}
          {/* Badge for new users */}
          {user.isNew && !user.isTrending && !user.isRecentActive && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
              <span className="text-xs text-white">🆕</span>
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1">
            <Link
              href={`/${user.username}`}
              className="truncate text-sm font-semibold text-gray-900 hover:text-sky-500"
            >
              {user.firstName} {user.lastName}
            </Link>
            {/* Show badge text for trending users */}
            {user.isTrending && (
              <span className="rounded bg-orange-100 px-1 text-xs text-orange-600">
                Trending
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{user.username}</p>
          <div className="mt-2">
            <button
              className={`flex w-full items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-sky-100 text-sky-600 hover:bg-sky-500 hover:text-white'
              } disabled:opacity-60`}
              onClick={() => follow(undefined)}
              disabled={isFollowing || loading}
            >
              <IoPersonAddSharp className="h-4 w-4" aria-hidden="true" />
              {isFollowing ? 'Following' : loading ? 'Following...' : 'Follow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const MobileDiscoverDrawer = ({
  isOpen,
  onClose,
  otherUsers
}: MobileDiscoverDrawerProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Discover People
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <IoClose className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {otherUsers.map((user) => (
                <UserSuggestion key={`layout-mobile-${user._id}`} user={user} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileDiscoverDrawer
