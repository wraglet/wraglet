import getPostsByUsername from '@/actions/getPostsByUsername'

import Header from '@/app/(authenticated)/[username]/_components/Header'
import ProfilePostsClientWrapper from '@/app/(authenticated)/[username]/_components/ProfilePostsClientWrapper'

const ProfilePage = async ({
  params
}: {
  params: Promise<{ username: string }>
}) => {
  const { username } = await params
  const decodedUsername = decodeURIComponent(username)

  const initialPosts = await getPostsByUsername(decodedUsername)

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-y-6 overflow-hidden pb-20 lg:pb-6">
      <Header username={decodedUsername} />
      <ProfilePostsClientWrapper
        initialPosts={initialPosts}
        username={decodedUsername}
      />
    </main>
  )
}

export default ProfilePage
