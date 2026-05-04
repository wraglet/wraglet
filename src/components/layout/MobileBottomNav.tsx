'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { Gender } from '@/interfaces'
import { useIsClient } from '@/lib/hooks/useIsClient'
import useUserStore from '@/store/user'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

import Avatar from '@/components/shared/Avatar'
import { BlogOutlineIcon, VideoIcon } from '@/components/shared/Icons'

const MobileBottomNav = () => {
  const { user } = useUserStore()
  const hydrated = useIsClient()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const feedTab = searchParams.get('tab')

  if (!hydrated || !user) {
    return null
  }

  const navItems = [
    {
      href: '/feed',
      label: 'Home',
      icon: (
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6"
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
      href: '/feed?tab=blogs',
      label: 'Blog',
      icon: <BlogOutlineIcon className="h-5 w-5 sm:h-6 sm:w-6" />
    },
    {
      href: '/feed?tab=videos',
      label: 'Videos',
      icon: <VideoIcon className="h-5 w-5 sm:h-6 sm:w-6" />
    },
    {
      href: '/settings/profile',
      label: 'Settings',
      icon: <Cog6ToothIcon className="h-5 w-5 sm:h-6 sm:w-6" />
    },
    {
      href: `/${user.username}`,
      label: 'Profile',
      icon: (
        <Avatar
          gender={user.gender as Gender}
          className="h-5 w-5 sm:h-6 sm:w-6"
          alt={`${user.firstName}'s Profile`}
          src={user.profilePicture?.url!}
        />
      )
    }
  ]

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm lg:hidden"
      aria-label="Primary"
    >
      <div className="flex h-[3.5rem] items-center justify-around px-0.5 sm:h-16 sm:px-1">
        {navItems.map((item) => {
          const isActive = (() => {
            if (item.href === '/feed') {
              return (
                pathname === '/feed' && (feedTab === null || feedTab === 'all')
              )
            }
            if (item.href === '/feed?tab=blogs') {
              return pathname === '/feed' && feedTab === 'blogs'
            }
            if (item.href === '/feed?tab=videos') {
              return pathname === '/feed' && feedTab === 'videos'
            }
            if (
              item.href === '/settings/profile' &&
              pathname.startsWith('/settings')
            ) {
              return true
            }
            return pathname === item.href
          })()
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 transition-colors sm:gap-1 sm:px-2 sm:py-2 ${
                isActive
                  ? 'text-[#0EA5E9]'
                  : 'text-gray-600 hover:text-[#0EA5E9]'
              }`}
            >
              <div className={isActive ? 'scale-105' : ''}>{item.icon}</div>
              <span className="max-w-[4.5rem] text-center text-[9px] leading-tight font-medium sm:max-w-none sm:text-[10px] sm:leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileBottomNav
