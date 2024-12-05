'use client'

import dynamic from 'next/dynamic'
import { PostDocument } from '@/models/Post'

const ProfilePostsAbly = dynamic(() => import('./ProfilePostsAbly'), {
  ssr: false
})

const ProfilePostsClientWrapper = ({
  initialPosts,
  username
}: {
  initialPosts: PostDocument[]
  username: string
}) => {
  return <ProfilePostsAbly initialPosts={initialPosts} username={username} />
}

export default ProfilePostsClientWrapper
