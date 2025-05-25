'use client'

import { usePathname } from 'next/navigation'
import type { IUser } from '@/models/User'

import ChatFloaterServer from '@/components/ChatFloaterServer'
import Header from '@/components/Header'

interface Props {
  currentUser: IUser
  children: React.ReactNode
}

const AuthenticatedLayoutClientWrapper = ({ currentUser, children }: Props) => {
  const pathname = usePathname()
  const isMessagesRoute = pathname.startsWith('/messages')

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[rgba(110,201,247,0.15)]">
      <Header currentUser={currentUser} />
      {children}
      {!isMessagesRoute && <ChatFloaterServer currentUser={currentUser} />}
    </div>
  )
}

export default AuthenticatedLayoutClientWrapper
