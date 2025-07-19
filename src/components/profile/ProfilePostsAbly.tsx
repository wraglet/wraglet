'use client'

import { IPost } from '@/models/Post'
import { ChannelProvider } from 'ably/react'

import ProfileBody from '@/components/profile/ProfileBody'

const ProfilePostsAbly = ({
  username,
  initialPosts
}: {
  username: string
  initialPosts: IPost[]
}) => {
  // Use the existing global AblyProvider from layout, just wrap with ChannelProvider
  return (
    <ChannelProvider channelName="post-channel">
      <ProfileBody username={username} initialPosts={initialPosts} />
    </ChannelProvider>
  )
}

export default ProfilePostsAbly
