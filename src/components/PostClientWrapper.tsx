'use client'

import dynamic from 'next/dynamic'
import { IPost } from '@/models/Post'
import { IShare } from '@/models/Share'

const PostWithAbly = dynamic(() => import('@/components/PostWithAbly'), {
  ssr: false
})
const SharedPostAbly = dynamic(() => import('@/components/SharedPostAbly'), {
  ssr: false
})

interface PostClientWrapperProps {
  post: IPost | (IShare & { type: 'share' })
}

const PostClientWrapper = ({ post }: PostClientWrapperProps) => {
  // Check if this is a shared post
  if ((post as any).type === 'share') {
    return <SharedPostAbly share={post as any} />
  }

  // Regular post
  return <PostWithAbly post={post as IPost} />
}

export default PostClientWrapper
