'use client'

import { IBlog } from '@/models/Blog'
import { ChannelProvider } from 'ably/react'

import BlogInteractions from '@/components/blog/BlogInteractions'

interface BlogInteractionsAblyProps {
  blog: IBlog
  currentUser: any
}

const BlogInteractionsAbly = ({
  blog,
  currentUser
}: BlogInteractionsAblyProps) => {
  // Use the existing global AblyProvider from layout, just wrap with ChannelProvider
  return (
    <ChannelProvider channelName={`blog-${blog._id}`}>
      <BlogInteractions blog={blog} currentUser={currentUser} />
    </ChannelProvider>
  )
}

export default BlogInteractionsAbly
