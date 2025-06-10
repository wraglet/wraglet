'use client'

import MessagesWithAbly from '@/components/messages/MessagesWithAbly'

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
