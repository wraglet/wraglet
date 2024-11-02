'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { PostInterface } from '@/interfaces'

const FeedAbly = dynamic(() => import('./FeedAbly'), { ssr: false })

const FeedClientWrapper = ({
  initialPosts
}: {
  initialPosts: PostInterface[]
}) => {
  return <FeedAbly initialPosts={initialPosts} />
}

export default FeedClientWrapper
