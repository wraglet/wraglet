'use client'

import { Suspense, useEffect } from 'react'
import { Quicksand } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { appHeaderGradientClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import { IUser } from '@/models/User'
import useGlobalStore from '@/store/global'
import useUserStore, { User } from '@/store/user'

import { DEFAULT_GENDER, DEFAULT_PRONOUN } from '@/data/constants'
import HeaderMessagesIconClientWrapper from '@/components/chat/HeaderMessagesIconClientWrapper'
import HeaderNotificationsIconClientWrapper from '@/components/chat/HeaderNotificationsIconClientWrapper'
import AvatarMenu from '@/components/shared/AvatarMenu'
import { ChatIcon, HomeIcon } from '@/components/shared/NavIcons'
import SearchBar from '@/components/shared/SearchBar'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true
})

const headerIconLinkClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0ea5e9] sm:h-10 sm:w-10 md:focus-visible:ring-offset-2'

const Header = ({ currentUser }: { currentUser: IUser & { _id: string } }) => {
  const { justLoggedIn, userInitialized, setJustLoggedIn, setUserInitialized } =
    useGlobalStore()
  const { setUser } = useUserStore()

  useEffect(() => {
    if (!justLoggedIn && !userInitialized) {
      setJustLoggedIn(true)
    }

    if (justLoggedIn && !userInitialized && currentUser) {
      const userWithDefaults = {
        ...currentUser,
        gender: currentUser.gender || DEFAULT_GENDER,
        pronoun: currentUser.pronoun || DEFAULT_PRONOUN
      }
      setUser(userWithDefaults as unknown as User)
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
    <header
      role="banner"
      className={cn(
        'fixed z-50 w-full overflow-visible border-b border-white/15 shadow-[0_4px_20px_-6px_rgba(14,165,233,0.45)]',
        appHeaderGradientClassName
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between gap-1.5 px-2 sm:gap-3 sm:px-4 md:gap-5 lg:px-8">
        <div className="flex min-w-0 flex-shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/feed"
            className="group flex items-center gap-1.5 rounded-2xl py-1 pr-1.5 pl-0.5 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:gap-2 sm:pr-2 sm:pl-1"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-xl shadow-md ring-2 ring-white/30 transition group-hover:ring-white/50 sm:h-9 sm:w-9 md:h-10 md:w-10">
              <Image
                src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/logo/android-chrome-192x192.png`}
                fill
                priority
                sizes="40px"
                alt="Wraglet"
                className="object-cover"
              />
            </div>
            <span
              className={`${quicksand.className} hidden text-lg font-bold tracking-tight text-white drop-shadow-sm sm:text-xl md:block`}
            >
              wraglet
            </span>
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 justify-center px-0.5 sm:px-1 md:px-4 lg:max-w-2xl lg:flex-initial lg:px-6">
          <SearchBar className="w-full max-w-full min-w-0" variant="header" />
        </div>

        <ul className="flex flex-shrink-0 items-center gap-0 overflow-visible sm:gap-1 md:gap-2">
          <li className="hidden md:block">
            <Link
              href="/feed"
              className={headerIconLinkClass}
              aria-label="Home feed"
            >
              <HomeIcon className="h-5 w-5" />
            </Link>
          </li>
          <li className="relative">
            <Suspense
              fallback={
                <span className={headerIconLinkClass} aria-hidden>
                  <ChatIcon className="h-5 w-5" />
                </span>
              }
            >
              <HeaderMessagesIconClientWrapper
                userId={currentUser?._id || ''}
              />
            </Suspense>
          </li>
          <li className="relative">
            <Suspense
              fallback={
                <span className={`${headerIconLinkClass} inline-flex`} />
              }
            >
              <HeaderNotificationsIconClientWrapper
                userId={currentUser?._id || ''}
              />
            </Suspense>
          </li>
          <li className="ml-0.5 flex items-center pl-0.5 md:ml-1 md:border-l md:border-white/20 md:pl-2">
            <AvatarMenu />
          </li>
        </ul>
      </div>
    </header>
  )
}

export default Header
