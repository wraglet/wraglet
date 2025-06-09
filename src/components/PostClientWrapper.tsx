'use client'

import dynamic from 'next/dynamic'
import { IPost } from '@/models/Post'
import { IShare } from '@/models/Share'

const PostAbly = dynamic(() => import('@/components/PostAbly'), { ssr: false })
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
  return <PostAbly post={post as IPost} />
}

export default PostClientWrapper
