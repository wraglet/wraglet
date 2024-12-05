'use client'

import { PostDocument } from '@/models/Post'
import * as Ably from 'ably'
import { AblyProvider, ChannelProvider } from 'ably/react'

import ProfileBody from '@/app/(authenticated)/[username]/_components/ProfileBody'

const ProfilePostsAbly = ({
  username,
  initialPosts
}: {
  username: string
  initialPosts: PostDocument[]
}) => {
  const client = new Ably.Realtime({ authUrl: '/api/token' })
  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName="post-channel">
        <ProfileBody username={username} initialPosts={initialPosts} />
      </ChannelProvider>
    </AblyProvider>
  )
}

export default ProfilePostsAbly
