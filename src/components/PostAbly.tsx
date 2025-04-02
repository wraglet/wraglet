'use client'

import { IPost } from '@/models/Post'
import { ChannelProvider } from 'ably/react'

import Post from '@/components/Post'

interface PostAblyProps {
  post: IPost
}

const PostAbly = ({ post }: PostAblyProps) => {
  return (
    <ChannelProvider channelName={`post-${post._id}`}>
      <Post post={post} />
    </ChannelProvider>
  )
}

export default PostAbly
