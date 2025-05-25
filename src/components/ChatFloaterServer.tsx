'use client'

import { Suspense } from 'react'
import { IUser } from '@/models/User'

import ChatFloaterClientWrapper from '@/components/ChatFloaterClientWrapper'

type Props = {
  currentUser: IUser
}

function ChatFloaterServer({ currentUser }: Props) {
  return (
    <Suspense fallback={null}>
      <ChatFloaterClientWrapper userId={(currentUser as any)._id} />
    </Suspense>
  )
}

export default ChatFloaterServer
