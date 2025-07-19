'use client'

import { usePathname } from 'next/navigation'
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
      <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[rgba(110,201,247,0.15)]">
        <Header currentUser={currentUser || null} />
        {children}
        {!isMessagesRoute && (
          <ChatFloaterServer currentUser={currentUser || null} />
        )}
        <MobileBottomNav />
      </div>
    </AblyProvider>
  )
}

export default AuthenticatedLayoutClientWrapper
