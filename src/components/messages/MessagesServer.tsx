'use client'

import { Suspense } from 'react'

import MessagesClientWrapper from '@/components/messages/MessagesClientWrapper'

type Props = {
  userId: string
}

const MessagesServer = ({ userId }: Props) => {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Suspense fallback={<div>Loading messages...</div>}>
        <MessagesClientWrapper userId={userId} />
      </Suspense>
    </div>
  )
}

export default MessagesServer
