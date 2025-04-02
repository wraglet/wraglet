'use client'

import dynamic from 'next/dynamic'
import { IPost } from '@/models/Post'

const FeedAbly = dynamic(
  () => import('@/app/(authenticated)/feed/_components/Feed/FeedAbly'),
  { ssr: false }
)

interface FeedClientWrapperProps {
  initialPosts: IPost[]
}

const FeedClientWrapper = ({ initialPosts }: FeedClientWrapperProps) => {
  return <FeedAbly initialPosts={initialPosts} />
}

export default FeedClientWrapper
