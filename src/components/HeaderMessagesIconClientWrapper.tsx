'use client'

import dynamic from 'next/dynamic'
import { ChannelProvider } from 'ably/react'

const HeaderMessagesIcon = dynamic(
  () => import('@/components/HeaderMessagesIcon'),
  {
    ssr: false
  }
)

export interface HeaderMessagesIconClientWrapperProps {
  userId: string
}

const HeaderMessagesIconClientWrapper = ({
  userId
}: HeaderMessagesIconClientWrapperProps) => {
  return (
    <ChannelProvider channelName={`user-${userId}-messages`}>
      <HeaderMessagesIcon userId={userId} />
    </ChannelProvider>
  )
}

export default HeaderMessagesIconClientWrapper
