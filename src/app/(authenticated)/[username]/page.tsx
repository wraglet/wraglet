import type { Metadata } from 'next'
import getPostsByUsername from '@/actions/getPostsByUsername'
import getUserByUsername from '@/actions/getUserByUsername'

import ProfilePageClient from '@/components/profile/ProfilePageClient'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export const generateMetadata = async ({
  params
}: ProfilePageProps): Promise<Metadata> => {
  const { username } = await params
  const decodedUsername = decodeURIComponent(username)
  const user = await getUserByUsername(decodedUsername)

  if (!user) {
    return { title: 'Profile not found' }
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username

  return {
    title: `${displayName} (@${user.username})`,
    description: user.bio || `View ${displayName}'s profile on Wraglet`
  }
}

const ProfilePage = async ({ params }: ProfilePageProps) => {
  const { username } = await params
  const decodedUsername = decodeURIComponent(username)
  const initialPosts = await getPostsByUsername(decodedUsername)

  return (
    <ProfilePageClient username={decodedUsername} initialPosts={initialPosts} />
  )
}

export default ProfilePage
