'use client'

import dynamic from 'next/dynamic'
import { ChannelProvider } from 'ably/react'

const HeaderNotificationsIcon = dynamic(
  () => import('@/components/HeaderNotificationsIcon'),
  {
    ssr: false
  }
)

export interface HeaderNotificationsIconClientWrapperProps {
  userId: string
}

const HeaderNotificationsIconClientWrapper = ({
  userId
}: HeaderNotificationsIconClientWrapperProps) => {
  return (
    <ChannelProvider channelName={`user-${userId}-notifications`}>
      <HeaderNotificationsIcon userId={userId} />
    </ChannelProvider>
  )
}

export default HeaderNotificationsIconClientWrapper
