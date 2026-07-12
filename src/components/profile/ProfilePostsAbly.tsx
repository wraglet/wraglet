'use client'

import { ChannelProvider } from 'ably/react'

import type { ProfileFeedItem } from '@/types/profileFeed'
import ProfileBody from '@/components/profile/ProfileBody'

const ProfilePostsAbly = ({
  username,
  initialPosts
}: {
  username: string
  initialPosts: ProfileFeedItem[]
}) => {
  // Use the existing global AblyProvider from layout, just wrap with ChannelProvider
  return (
    <ChannelProvider channelName="post-channel">
      <ProfileBody username={username} initialPosts={initialPosts} />
    </ChannelProvider>
  )
}

export default ProfilePostsAbly
