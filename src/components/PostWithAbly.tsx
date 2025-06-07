'use client'

import { IPost } from '@/models/Post'
import { ChannelProvider } from 'ably/react'

import Post from '@/components/Post'

interface PostWithAblyProps {
  post: IPost
}

const PostWithAbly = ({ post }: PostWithAblyProps) => {
  return (
    <ChannelProvider channelName={`post-${post._id}`}>
      <Post post={post} />
    </ChannelProvider>
  )
}

export default PostWithAbly
