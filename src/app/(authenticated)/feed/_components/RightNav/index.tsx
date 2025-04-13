'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserInterface } from '@/interfaces'
import { IoPersonAddSharp } from 'react-icons/io5'

import Avatar from '@/components/Avatar'

const RightNav = ({ otherUsers }: { otherUsers: UserInterface[] }) => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // This forces a rerender, so the date is rendered
    // the second time but not the first
    setHydrated(true)
  }, [])

  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null
  }

  return (
    <aside className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[280px] flex-shrink-0 overflow-y-auto md:block xl:w-[320px]">
      <div className="flex h-full flex-col gap-4 py-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Friend Suggestions
          </h2>

          <div className="flex flex-col gap-4">
            {otherUsers.map((user) => (
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
                      {user.friends.length} mutual friends
                    </p>
                    <button className="mt-1 w-fit rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-600 transition-all duration-200 hover:bg-sky-500 hover:text-white">
                      Follow
                    </button>
                  </div>
                </div>

                <button className="absolute top-2.5 right-2.5 rounded-full p-1.5 text-sky-400 transition-all duration-200 group-hover:text-sky-500 hover:bg-sky-100">
                  <IoPersonAddSharp className="h-[18px] w-[18px]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default RightNav
