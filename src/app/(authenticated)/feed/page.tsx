import { Suspense } from 'react'
import getCurrentUser from '@/actions/getCurrentUser'
import getOtherUsers from '@/actions/getOtherUsers'
import getPosts from '@/actions/getPosts'

import FeedClientWrapper from '@/app/(authenticated)/feed/_components/Feed/FeedClientWrapper'
import LeftNav from '@/app/(authenticated)/feed/_components/LeftNav'
import RightNav from '@/app/(authenticated)/feed/_components/RightNav'
import Loading from '@/app/loading'

const Page = async () => {
  const otherUsers = await getOtherUsers().catch((err: any) => {
    console.error(
      'Error happened while getting getOtherUsers() on Feed component: ',
      err
    )
  })

  const currentUser = await getCurrentUser()

  const initialPosts = await getPosts().catch((err: any) => {
    console.error(
      'Error happened while getting getPosts() on Feed component: ',
      err
    )
  })

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-start px-4">
      <LeftNav />
      <div className="mx-auto flex h-[calc(100vh-3.5rem)] flex-1 px-4 md:px-8">
        <div className="w-full overflow-y-auto pt-14">
          <Suspense fallback={<Loading />}>
            <FeedClientWrapper initialPosts={initialPosts} />
          </Suspense>
        </div>
      </div>
      <RightNav otherUsers={otherUsers} currentUserId={currentUser?._id} />
    </main>
  )
}

export default Page
