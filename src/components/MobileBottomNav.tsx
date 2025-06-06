'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useUserStore from '@/store/user'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

import Avatar from '@/components/Avatar'
import { BlogOutlineIcon } from '@/components/Icons'

import VideoIcon from '@/app/(authenticated)/feed/_components/LeftNav/icons/VideoIcon'

const MobileBottomNav = () => {
  const { user } = useUserStore()
  const [hydrated, setHydrated] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated || !user) {
    return null
  }

  const navItems = [
    {
      href: '/feed',
      label: 'Home',
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      )
    },
    {
      href: '/blog',
      label: 'Blog',
      icon: <BlogOutlineIcon className="h-6 w-6" />
    },
    {
      href: '/videos',
      label: 'Videos',
      icon: <VideoIcon className="h-6 w-6" />
    },
    {
      href: '/settings/profile',
      label: 'Settings',
      icon: <Cog6ToothIcon className="h-6 w-6" />
    },
    {
      href: `/${user.username}`,
      label: 'Profile',
      icon: (
        <Avatar
          gender={user.gender}
          className="h-6 w-6"
          alt={`${user.firstName}'s Profile`}
          src={user.profilePicture?.url!}
        />
      )
    }
  ]

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur-sm lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/settings/profile' &&
              pathname.startsWith('/settings'))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors ${
                isActive
                  ? 'text-[#0EA5E9]'
                  : 'text-gray-600 hover:text-[#0EA5E9]'
              }`}
            >
              <div className={isActive ? 'scale-110' : ''}>{item.icon}</div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileBottomNav
