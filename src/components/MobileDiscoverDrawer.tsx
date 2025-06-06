'use client'

import { useCallback, useEffect } from 'react'
import Link from 'next/link'
import { UserInterface } from '@/interfaces'
import { useFollow } from '@/lib/hooks/useFollow'
import useChatFloaterStore from '@/store/chatFloater'
import toast from 'react-hot-toast'
import { IoClose, IoPersonAddSharp } from 'react-icons/io5'

import Avatar from '@/components/Avatar'

interface MobileDiscoverDrawerProps {
  isOpen: boolean
  onClose: () => void
  otherUsers: UserInterface[]
}

const UserSuggestion = ({ user }: { user: UserInterface }) => {
  const {
    isFollowing,
    follow,
    loading,
    followersCount,
    followingCount,
    isInitialLoading
  } = useFollow(user._id)
  const openChat = useChatFloaterStore((s) => s.openChat)

  const handleMessage = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds: [user._id] })
      })
      const json = await res.json()
      if (json.success && json.data?._id) {
        openChat(json.data._id)
      } else {
        toast.error('Failed to start chat')
      }
    } catch {
      toast.error('Failed to start chat')
    }
  }, [user._id, openChat])

  return (
    <div className="group relative flex items-center justify-between rounded-lg p-3 transition-all duration-200 hover:bg-sky-50/50">
      <div className="flex w-full items-center gap-3">
        <Link
          href={`/${user.username}`}
          className="block overflow-hidden rounded-full transition-transform duration-200 hover:scale-105"
        >
          <Avatar
            gender={user.gender}
            className="h-12 w-12 ring-2 ring-white"
            alt={`${user.firstName}'s Profile`}
            src={user.profilePicture?.url!}
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link
            href={`/${user.username}`}
            className="truncate text-sm font-semibold text-gray-900 hover:text-sky-500"
          >
            {user.firstName} {user.lastName}
          </Link>
          {isInitialLoading ? (
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200"></div>
          ) : (
            <p className="text-xs font-medium text-gray-500">
              {followersCount} followers · {followingCount} following
            </p>
          )}
          <div className="mt-2 flex gap-2">
            {isInitialLoading ? (
              <>
                <div className="h-7 flex-1 animate-pulse rounded-full bg-gray-200"></div>
                <div className="h-7 flex-1 animate-pulse rounded-full bg-gray-200"></div>
              </>
            ) : (
              <>
                <button
                  className="flex flex-1 items-center justify-center gap-1 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-600 transition-all duration-200 hover:bg-sky-500 hover:text-white disabled:opacity-60"
                  onClick={() => follow()}
                  disabled={isFollowing || loading}
                >
                  <IoPersonAddSharp className="h-4 w-4" aria-hidden="true" />
                  {isFollowing
                    ? 'Following'
                    : loading
                      ? 'Following...'
                      : 'Follow'}
                </button>
                <button
                  className="flex flex-1 items-center justify-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600 transition-all duration-200 hover:bg-blue-500 hover:text-white"
                  onClick={handleMessage}
                >
                  💬 Message
                </button>
              </>
            )}
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
                <UserSuggestion key={user._id} user={user} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileDiscoverDrawer
