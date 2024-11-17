'use client'

import * as Ably from 'ably'
import { AblyProvider, ChannelProvider } from 'ably/react'

import Body from '@/app/(authenticated)/[username]/_components/Body'
import { PostDocument } from '@/models/Post'

const ProfileParent = ({
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
        <Body username={username} initialPosts={initialPosts} />
      </ChannelProvider>
    </AblyProvider>
  )
}

export default ProfileParent
