'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { PostDocument } from '@/models/Post'

const FeedAbly = dynamic(() => import('./FeedAbly'), { ssr: false })

const FeedClientWrapper = ({
  initialPosts
}: {
  initialPosts: PostDocument[]
}) => {
  return <FeedAbly initialPosts={initialPosts} />
}

export default FeedClientWrapper
