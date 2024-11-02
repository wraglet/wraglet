import React from 'react'
import getPostsByUsername from '@/actions/getPostsByUsername'
import deJSONify from '@/utils/deJSONify'

import Header from '@/app/(authenticated)/[username]/_components/Header'
import ProfileParent from '@/app/(authenticated)/[username]/_components/ProfileParent'

const ProfilePage = async ({
  params
}: {
  params: Promise<{ username: string }>
}) => {
  const { username } = await params
  const decodedUsername = decodeURIComponent(username)

  const jsonInitialPosts = await getPostsByUsername(decodedUsername)
  const initialPosts = deJSONify(jsonInitialPosts)
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-y-6 overflow-hidden">
      <Header username={decodedUsername} />
      <ProfileParent initialPosts={initialPosts} />
    </main>
  )
}

export default ProfilePage
