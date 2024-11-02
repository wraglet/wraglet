'use client'

import { PostDocument } from '@/models/Post'
import * as Ably from 'ably'
import { AblyProvider, ChannelProvider } from 'ably/react'

import Body from '@/app/(authenticated)/[username]/_components/Body'

const ProfileParent = ({ initialPosts }: { initialPosts: PostDocument[] }) => {
  const client = new Ably.Realtime({ authUrl: '/api/token' })
  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName="post-channel">
        <Body initialPosts={initialPosts} />
      </ChannelProvider>
    </AblyProvider>
  )
}

export default ProfileParent
