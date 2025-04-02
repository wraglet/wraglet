'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import useUserStore from '@/store/user'

import Avatar from '@/components/Avatar'
import { BlogOutlineIcon } from '@/components/Icons'

import VideoIcon from './icons/VideoIcon'

const LeftSideNav = () => {
  const { user } = useUserStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) {
    return null
  }

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[280px] flex-shrink-0 lg:block xl:w-[320px]">
      <div className="flex h-full flex-col space-y-4 py-4">
        <Link
          href={`/${user?.username}`}
          className="group flex h-12 items-center rounded-lg border border-neutral-200 bg-white px-3 transition hover:bg-gray-400"
        >
          <div className="flex items-center space-x-3">
            <Avatar
              gender={user?.gender}
              className="group-hover:border-white"
              alt={`${user?.firstName}'s Profile`}
              src={user?.profilePicture?.url!}
            />
            <span className="text-sm font-semibold text-[#333333] group-hover:text-white">
              {user?.firstName}
            </span>
          </div>
        </Link>

        <nav className="flex flex-col rounded-lg border border-neutral-200 bg-white">
          <Link
            href="/blog"
            className="group h-12 w-full rounded-t-lg hover:bg-gray-400"
          >
            <div className="flex h-full items-center space-x-3 px-3">
              <BlogOutlineIcon className="h-6 w-6 text-[#536471] group-hover:text-white" />
              <span className="text-sm font-semibold text-[#333333] group-hover:text-white">
                Blog
              </span>
            </div>
          </Link>

          <Link
            href="/videos"
            className="group h-12 w-full rounded-b-lg hover:bg-gray-400"
          >
            <div className="flex h-full items-center space-x-3 px-3">
              <VideoIcon className="h-6 w-6 text-[#536471] group-hover:text-white" />
              <span className="text-sm font-semibold text-[#333333] group-hover:text-white">
                Videos
              </span>
            </div>
          </Link>
        </nav>

        <footer className="mt-auto pl-3 text-xs font-semibold text-[#0EA5E9]">
          &copy; {new Date().getFullYear()} Wraglet
        </footer>
      </div>
    </aside>
  )
}

export default LeftSideNav
