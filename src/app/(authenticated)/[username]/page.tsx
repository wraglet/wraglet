import getPostsByUsername from '@/actions/getPostsByUsername'
import getUserByUsername from '@/actions/getUserByUsername'
import deJSONify from '@/utils/deJSONify'

import Header from '@/app/(authenticated)/[username]/_components/Header'
import ProfilePostsClientWrapper from '@/app/(authenticated)/[username]/_components/ProfilePostsClientWrapper'

const ProfilePage = async ({
  params
}: {
  params: Promise<{ username: string }>
}) => {
  const { username } = await params
  const decodedUsername = decodeURIComponent(username)
  const user = await getUserByUsername(decodedUsername)

  const jsonInitialPosts = await getPostsByUsername(decodedUsername)
  const initialPosts = deJSONify(jsonInitialPosts)

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-y-6 overflow-hidden">
      <Header username={decodedUsername} />
      <ProfilePostsClientWrapper
        initialPosts={initialPosts}
        username={decodedUsername}
      />
    </main>
  )
}

export default ProfilePage
