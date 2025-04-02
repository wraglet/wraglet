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
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[280px] flex-shrink-0 overflow-y-auto md:block xl:w-[320px]">
      <div className="flex h-full flex-col py-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-[#333333]">
            Friend Suggestions
          </h2>

          <div className="flex flex-col space-y-2">
            {otherUsers.map((user) => (
              <div
                key={user._id}
                className="group flex items-center justify-between rounded-lg p-2 transition hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Link href={`/${user.username}`}>
                    <Avatar
                      gender={user.gender}
                      className="h-10 w-10"
                      alt={`${user.firstName}'s Profile`}
                      src={user.profilePicture?.url!}
                    />
                  </Link>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-[#333333]">
                        {user.firstName} {user.lastName}
                      </h3>
                      <button className="rounded border border-[#333333] px-2 py-0.5 text-xs font-medium text-[#333333] transition hover:border-blue-500 hover:text-blue-500">
                        Follow
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">
                      {user.friends.length} mutual friends
                    </p>
                  </div>
                </div>

                <button className="text-gray-600 hover:text-blue-500">
                  <IoPersonAddSharp className="h-5 w-5" />
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
