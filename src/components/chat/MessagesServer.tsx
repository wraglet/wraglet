'use client'

import MessagesWithAbly from '@/components/chat/MessagesWithAbly'

type Props = {
  userId: string
}

const MessagesServer = ({ userId }: Props) => {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <MessagesWithAbly />
    </div>
  )
}

export default MessagesServer
