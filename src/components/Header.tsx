'use client'

import React, { useEffect } from 'react'
import { Quicksand } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { UserInterface } from '@/interfaces'
import { UserDocument } from '@/models/User'
import useGlobalStore from '@/store/global'
import useUserStore from '@/store/user'

import AvatarMenu from '@/components/AvatarMenu'
import { BellIcon, ChatIcon, HomeIcon, PeopleIcon } from '@/components/NavIcons'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true
})

const Header = ({ currentUser }: { currentUser: UserDocument }) => {
  const { justLoggedIn, userInitialized, setJustLoggedIn, setUserInitialized } =
    useGlobalStore()
  const { setUser } = useUserStore()

  useEffect(() => {
    if (!justLoggedIn && !userInitialized) {
      setJustLoggedIn(true)
    }

    if (justLoggedIn && !userInitialized) {
      const transformedUser = {
        ...currentUser,
        friends: currentUser?.friends.map(
          (friend: { userId: string }) => friend.userId
        )
      } as unknown as UserInterface
      setUser(transformedUser)
      setUserInitialized(true)
      setJustLoggedIn(false)
    }
  }, [
    setUser,
    currentUser,
    justLoggedIn,
    userInitialized,
    setJustLoggedIn,
    setUserInitialized
  ])

  return (
    <header className="fixed z-50 flex h-[56px] w-full items-center justify-between gap-x-5 bg-[#0EA5E9] px-2.5 drop-shadow-md md:gap-x-8 lg:gap-x-10 lg:px-6">
      <div className="col-span-2 flex h-full items-center space-x-1.5">
        <Link href="/feed" className="block">
          <div className="relative h-10 w-10">
            <Image
              src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/logo/android-chrome-192x192.png`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              alt="Wraglet"
            />
          </div>
        </Link>
        <Link
          href={'/feed'}
          className={`${quicksand.className} hidden text-xl font-bold text-white md:block`}
        >
          wraglet
        </Link>
      </div>
      <div className="flex h-full w-full items-center lg:w-[600px]">
        <input
          type="search"
          className="h-[30px] w-full rounded-2xl border border-solid border-[#E5E5E5] bg-[#E7ECF0] px-2 text-sm text-[#333333] focus:outline-none"
        />
      </div>
      <ul className="flex items-center justify-between gap-x-4 lg:gap-x-6">
        <li className="hidden cursor-pointer md:block">
          <Link href={'/feed'}>
            <HomeIcon className="text-white" />
          </Link>
        </li>
        <li className="cursor-pointer">
          <PeopleIcon className="text-white" />
        </li>
        <li className="cursor-pointer">
          <ChatIcon className="text-white" />
        </li>
        <li className="cursor-pointer">
          <BellIcon className="text-white" />
        </li>
        <AvatarMenu />
      </ul>
    </header>
  )
}

export default Header
