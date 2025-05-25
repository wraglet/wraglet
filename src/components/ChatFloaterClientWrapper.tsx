'use client'

import dynamic from 'next/dynamic'

interface ChatFloaterClientWrapperProps {
  userId: string
}

const ChatFloaterAbly = dynamic(() => import('./ChatFloaterAbly'), {
  ssr: false
})

const ChatFloaterClientWrapper = ({
  userId
}: ChatFloaterClientWrapperProps) => {
  return <ChatFloaterAbly userId={userId} />
}

export default ChatFloaterClientWrapper
