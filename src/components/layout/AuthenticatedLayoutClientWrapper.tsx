'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { IUser } from '@/models/User'
import { AblyProvider } from '@/providers/AblyProvider'

import ChatFloaterServer from '@/components/chat/ChatFloaterServer'
import Header from '@/components/layout/Header'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

interface Props {
  currentUser: IUser & { _id: string }
  children: React.ReactNode
}

const AuthenticatedLayoutClientWrapper = ({ currentUser, children }: Props) => {
  const pathname = usePathname()
  const isMessagesRoute = pathname.startsWith('/messages')

  return (
    <AblyProvider>
      <div
        className={cn(
          'relative flex flex-col items-center overflow-hidden',
          appShellPageWashClassName,
          isMessagesRoute
            ? 'h-screen'
            : 'min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0'
        )}
      >
        <Header currentUser={currentUser || null} />
        {children}
        {!isMessagesRoute && (
          <ChatFloaterServer currentUser={currentUser || null} />
        )}
        <Suspense
          fallback={
            <nav
              className="fixed right-0 bottom-0 left-0 z-50 h-[3.5rem] border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm sm:h-16 lg:hidden"
              aria-hidden
            />
          }
        >
          <MobileBottomNav />
        </Suspense>
      </div>
    </AblyProvider>
  )
}

export default AuthenticatedLayoutClientWrapper
