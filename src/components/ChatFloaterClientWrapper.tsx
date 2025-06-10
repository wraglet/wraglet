'use client'

import dynamic from 'next/dynamic'

const ChatFloaterAbly = dynamic(() => import('./ChatFloaterAbly'), {
  ssr: false
})

export interface ChatFloaterClientWrapperProps {
  userId: string
}

const ChatFloaterClientWrapper = () => {
  return <ChatFloaterAbly />
}

export default ChatFloaterClientWrapper
