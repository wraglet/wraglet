'use client'

import dynamic from 'next/dynamic'

import type { ProfileFeedItem } from '@/types/profileFeed'

const ProfilePostsAbly = dynamic(
  () => import('@/components/profile/ProfilePostsAbly'),
  { ssr: false }
)

interface ProfilePostsClientWrapperProps {
  username: string
  initialPosts: ProfileFeedItem[]
}

const ProfilePostsClientWrapper = ({
  username,
  initialPosts
}: ProfilePostsClientWrapperProps) => {
  return <ProfilePostsAbly username={username} initialPosts={initialPosts} />
}

export default ProfilePostsClientWrapper
