'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import useUserStore from '@/store/user'

import Avatar from '@/components/Avatar'
import { BlogOutlineIcon } from '@/components/Icons'

import VideoIcon from './icons/VideoIcon'

const LeftSideNav = () => {
  const { user } = useUserStore()
  console.log('user: ', user)
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
    <section className="relative hidden h-[calc(100vh-56px)] lg:block lg:w-[280px] xl:w-[360px]">
      <div
        className={`fixed bottom-0 top-14 ml-4 flex h-[calc(100vh-56px)] flex-col overflow-y-auto lg:left-0 lg:w-[280px] 2xl:w-[360px] 3xl:left-auto 3xl:ml-auto`}
      >
        <div className="mt-4 flex flex-1 flex-col gap-y-6">
          <Link
            href={`/${user?.username}`}
            className="group flex h-[50px] w-full cursor-pointer items-center rounded-lg border border-solid border-neutral-200 bg-white px-3 drop-shadow-md hover:bg-gray-400"
          >
            <div className="flex items-center space-x-2">
              <Avatar
                gender={user?.gender}
                className="group-hover:border-white"
                alt={`${user?.firstName}'s Profile`}
                src={user?.profilePicture?.url!}
              />
              <h2 className="text-xs font-semibold text-[#333333] group-hover:text-white">
                {user?.firstName}
              </h2>
            </div>
          </Link>
          <div className="flex flex-col rounded-lg border border-solid border-neutral-200 bg-white drop-shadow-md">
            <div className="group h-[50px] w-full rounded-[inherit] hover:bg-gray-400">
              <div className="flex h-full w-full items-center space-x-2 px-3">
                <BlogOutlineIcon className="h-7 w-7 text-[#536471] group-hover:text-white" />
                <h2 className="text-xs font-semibold text-[#333333] group-hover:text-white">
                  Blog
                </h2>
              </div>
            </div>

            <div className="group h-[50px] w-full rounded-[inherit] hover:bg-gray-400">
              <div className="flex h-full w-full items-center space-x-2 px-3">
                <VideoIcon className="h-7 w-7 text-[#536471] group-hover:text-white" />
                <h2 className="text-xs font-semibold text-[#333333] group-hover:text-white">
                  Videos
                </h2>
              </div>
            </div>
          </div>
        </div>
        <footer className="mt-4 pb-2 pl-3 text-xs font-semibold text-[#0EA5E9]">
          &copy; {new Date().getFullYear()} Wraglet
        </footer>
      </div>
    </section>
  )
}

export default LeftSideNav
