'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserInterface } from '@/interfaces'
import { IoPersonAddSharp } from 'react-icons/io5'

import Avatar from '@/components/Avatar'

const RightNav = ({
  otherUsers,
  currentUserId
}: {
  otherUsers: UserInterface[]
  currentUserId: string
}) => {
  const [hydrated, setHydrated] = useState(false)
  const [loadingIds, setLoadingIds] = useState<string[]>([])
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => {
    // This forces a rerender, so the date is rendered
    // the second time but not the first
    setHydrated(true)
  }, [])

  const handleFollow = async (targetUserId: string) => {
    setLoadingIds((prev) => [...prev, targetUserId])
    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      })
      const data = await res.json()
      if (data.success) {
        setFollowingIds((prev) => [...prev, targetUserId])
      } else {
        // Optionally show error
      }
    } catch (e) {
      // Optionally show error
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== targetUserId))
    }
  }

  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null
  }

  return (
    <aside className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[280px] flex-shrink-0 overflow-y-auto md:block xl:w-[320px]">
      <div className="flex h-full flex-col gap-4 py-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Discover People
          </h2>

          <div className="flex flex-col gap-4">
            {otherUsers.map((user) => {
              const isFollowing = followingIds.includes(user._id)
              const isLoading = loadingIds.includes(user._id)
              return (
                <div
                  key={user._id}
                  className="group relative flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 hover:bg-sky-50/50"
                >
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/${user.username}`}
                      className="block overflow-hidden rounded-full transition-transform duration-200 hover:scale-105"
                    >
                      <Avatar
                        gender={user.gender}
                        className="h-11 w-11 ring-2 ring-white"
                        alt={`${user.firstName}'s Profile`}
                        src={user.profilePicture?.url!}
                      />
                    </Link>
                    <div className="flex flex-col gap-0.5">
                      <Link
                        href={`/${user.username}`}
                        className="text-sm font-semibold text-gray-900 hover:text-sky-500"
                      >
                        {user.firstName} {user.lastName}
                      </Link>
                      <p className="text-xs font-medium text-gray-500">
                        {user.followers &&
                        user.following &&
                        user.followers.includes(currentUserId) &&
                        user.following.includes(currentUserId)
                          ? `${user.followers.length} mutuals`
                          : `${user.followers.length} followers`}
                      </p>
                      <button
                        className="mt-1 flex w-fit items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-600 transition-all duration-200 hover:bg-sky-500 hover:text-white disabled:opacity-60"
                        onClick={() => handleFollow(user._id)}
                        disabled={isFollowing || isLoading}
                      >
                        <IoPersonAddSharp
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        {isFollowing
                          ? 'Following'
                          : isLoading
                            ? 'Following...'
                            : 'Follow'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default RightNav
