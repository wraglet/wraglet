'use client'

import React, { Fragment } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import useFeedPostsStore from '@/store/feedPosts'
import useGlobalStore from '@/store/global'
import useUserStore from '@/store/user'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition
} from '@headlessui/react'
import { FaCircleUser } from 'react-icons/fa6'
import {
  HiCog,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog
} from 'react-icons/hi2'

import Avatar from '@/components/Avatar'

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
    <Menu as="li" className="inline-flex">
      <MenuButton className="relative h-8 w-8 cursor-pointer rounded-full border border-solid border-white">
        <Avatar
          gender={user?.gender}
          size="h-8 w-8"
          src={user?.profilePicture?.url!}
          alt={'Avatar'}
        />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-6 mt-12 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden">
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
              <button
                type="button"
                className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 data-focus:bg-[#1B87EA] data-focus:text-white"
              >
                <HiOutlineCog
                  className="mr-2 h-5 w-5 group-data-focus:hidden"
                  aria-hidden="true"
                />
                <HiCog
                  className="mr-2 hidden h-5 w-5 group-data-focus:inline"
                  aria-hidden="true"
                />
                Account Settings
              </button>
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
      </Transition>
    </Menu>
  )
}

export default AvatarMenu
