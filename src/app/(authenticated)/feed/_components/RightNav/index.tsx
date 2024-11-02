'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserInterface } from '@/interfaces'
import { IoPersonAddSharp } from 'react-icons/io5'

import Avatar from '@/components/Avatar'

const RigthNav = ({ otherUsers }: { otherUsers: UserInterface[] }) => {
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
    <section className="relative hidden h-[calc(100vh-56px)] md:w-[280px] tablet:flex xl:w-[360px]">
      <div
        className={`fixed bottom-0 right-0 top-14 mt-4 overflow-y-auto md:w-[280px] lg:flex 2xl:w-[360px] 3xl:right-auto`}
      >
        <div className="w-full px-4 py-3 drop-shadow-md">
          <div className="flex w-full flex-col gap-y-3.5">
            <h6 className={`ml-4 text-xs font-normal text-[#333333]`}>
              Friend Suggestions
            </h6>

            {otherUsers.map((user) => (
              <div
                key={user._id}
                className="hover:ring-solid group flex h-[50px] cursor-pointer items-center rounded-lg px-3 hover:bg-white hover:ring-1 hover:ring-neutral-200"
              >
                <div className="flex flex-1 items-center space-x-2">
                  <Link href={`/${user.username}`}>
                    <Avatar
                      gender={user.gender}
                      className="group-hover:border-white"
                      alt={`${user.firstName}'s Profile`}
                      src={user.profilePicture?.url!}
                    />
                  </Link>
                  <div className="flex flex-col gap-y-0.5">
                    <div className="flex items-center gap-4">
                      <h3 className="text-sm font-semibold text-[#333333] group-hover:text-gray-700">
                        {user.firstName} {user.lastName}{' '}
                      </h3>
                      {/* <FaPlus className='hover:text-blue-500 text-sm' /> */}
                      <span className="rounded border border-solid border-[#333333] px-1 text-xs font-semibold text-[#333333] hover:border-blue-500 hover:text-blue-500">
                        Follow
                      </span>
                    </div>
                    <h4 className="text-[10px] font-semibold text-[#333333] group-hover:text-gray-700">
                      {user.friends.length} mutual friends
                    </h4>
                  </div>
                </div>

                <IoPersonAddSharp className="hover:text-blue-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RigthNav
