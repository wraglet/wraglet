'use client'

import { Suspense } from 'react'
import type { IUser } from '@/models/User'

import ChatFloaterClientWrapper from '@/components/ChatFloaterClientWrapper'

interface ChatFloaterServerProps {
  currentUser: IUser
}

const ChatFloaterServer = ({ currentUser }: ChatFloaterServerProps) => {
  return (
    <Suspense fallback={null}>
      <ChatFloaterClientWrapper />
    </Suspense>
  )
}

export default ChatFloaterServer
