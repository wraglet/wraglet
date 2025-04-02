'use client'

import dynamic from 'next/dynamic'
import { IPost } from '@/models/Post'

const PostAbly = dynamic(() => import('@/components/PostAbly'), { ssr: false })

interface PostClientWrapperProps {
  post: IPost
}

const PostClientWrapper = ({ post }: PostClientWrapperProps) => {
  return <PostAbly post={post} />
}

export default PostClientWrapper
