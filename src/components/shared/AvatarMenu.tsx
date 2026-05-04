'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Gender } from '@/interfaces'
import useFeedPostsStore from '@/store/feedPosts'
import useGlobalStore from '@/store/global'
import useUserStore from '@/store/user'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { FaCircleUser } from 'react-icons/fa6'
import {
  HiCog,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog
} from 'react-icons/hi2'

import { DEFAULT_GENDER } from '@/data/constants'
import Avatar from '@/components/shared/Avatar'

const AvatarMenu = () => {
  const { user, clearUser } = useUserStore()
  const { clearGlobalState } = useGlobalStore()
  const { clearFeedPosts } = useFeedPostsStore()

  const handleLogout = () => {
    signOut()
    clearUser()
    clearGlobalState()
    clearFeedPosts()
  }
  return (
    <Menu as="div" className="relative inline-flex items-center">
      <MenuButton className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white/55 p-0 shadow-md ring-2 ring-white/30 transition hover:border-white/85 hover:ring-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0ea5e9]">
        <Avatar
          gender={(user?.gender || DEFAULT_GENDER) as Gender}
          className="min-h-0 min-w-0 !border-0"
          size="h-full w-full"
          src={user?.profilePicture?.url || null}
          alt="Avatar"
        />
      </MenuButton>
      <MenuItems
        portal
        transition
        anchor={{ to: 'bottom end', gap: '0.5rem', padding: '0.5rem' }}
        className="z-[100] w-56 max-w-[min(14rem,calc(100vw-1rem))] origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-xl ring-1 ring-black/5 transition duration-100 ease-out focus:outline-hidden data-closed:scale-95 data-closed:opacity-0"
      >
        <div className="px-1 py-1">
          <MenuItem>
            <Link
              href={`/${user?.username}`}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 data-focus:bg-[#1B87EA] data-focus:text-white"
            >
              <FaCircleUser className="mr-2 h-5 w-5" aria-hidden="true" />
              {user?.firstName}
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              href="/settings/account"
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 transition-colors hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700"
            >
              <HiOutlineCog
                className="mr-2 h-5 w-5 group-hover:hidden group-focus:hidden"
                aria-hidden="true"
              />
              <HiCog
                className="mr-2 hidden h-5 w-5 group-hover:inline group-focus:inline"
                aria-hidden="true"
              />
              Account Settings
            </Link>
          </MenuItem>
        </div>

        <div className="px-1 py-1">
          <MenuItem>
            <button
              type="button"
              onClick={handleLogout}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 data-focus:bg-[#1B87EA] data-focus:text-white"
            >
              <HiOutlineArrowRightOnRectangle
                className="mr-2 h-5 w-5 text-red-400 group-data-focus:text-white"
                aria-hidden="true"
              />
              Logout
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}

export default AvatarMenu
