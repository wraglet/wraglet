'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import useUserStore from '@/store/user'

import Avatar from '@/components/shared/Avatar'
import {
  AllIcon,
  BlogOutlineIcon,
  EventsIcon,
  VideoIcon
} from '@/components/shared/Icons'

const LeftSideNav = () => {
  const { user } = useUserStore()
  const [hydrated, setHydrated] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'all'

  useEffect(() => {
    setHydrated(true)
  }, [])

  const handleTabClick = (tab: string) => {
    router.push(`/feed?tab=${tab}`)
  }

  if (!hydrated) {
    return null
  }

  const navItems = [
    { key: 'all', label: 'All', icon: AllIcon },
    { key: 'blogs', label: 'Blogs', icon: BlogOutlineIcon },
    { key: 'videos', label: 'Videos', icon: VideoIcon },
    { key: 'events', label: 'Events', icon: EventsIcon }
  ]

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[280px] flex-shrink-0 lg:block xl:w-[320px]">
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-4 p-4">
          <Link
            href={`/${user?.username}`}
            className="group flex h-12 items-center rounded-lg border border-neutral-200 bg-white px-3 transition hover:bg-gray-400"
          >
            <div className="flex items-center space-x-3">
              {user && user.gender ? (
                <Avatar
                  gender={user.gender}
                  className="group-hover:border-white"
                  alt={`${user.firstName}'s Profile`}
                  src={user.profilePicture?.url || null}
                />
              ) : (
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
              )}
              <span className="text-sm font-semibold text-[#333333] group-hover:text-white">
                {user?.firstName}
              </span>
            </div>
          </Link>

          <nav className="flex flex-col rounded-lg border border-neutral-200 bg-white">
            {navItems.map((item, index) => {
              const isActive = currentTab === item.key
              const isFirst = index === 0
              const isLast = index === navItems.length - 1

              return (
                <button
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  className={`group h-12 w-full transition ${
                    isFirst ? 'rounded-t-lg' : isLast ? 'rounded-b-lg' : ''
                  } ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-400'
                  }`}
                >
                  <div className="flex h-full items-center space-x-3 px-3">
                    <item.icon
                      className={`h-6 w-6 ${
                        isActive
                          ? 'text-white'
                          : 'text-[#536471] group-hover:text-white'
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        isActive
                          ? 'text-white'
                          : 'text-[#333333] group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        <footer className="flex-shrink-0 border-t border-neutral-200 bg-white p-4 text-xs font-semibold text-[#0EA5E9]">
          &copy; {new Date().getFullYear()} Wraglet
        </footer>
      </div>
    </aside>
  )
}

export default LeftSideNav
