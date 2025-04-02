import { Suspense } from 'react'
import getOtherUsers from '@/actions/getOtherUsers'
import getPosts from '@/actions/getPosts'
import deJSONify from '@/utils/deJSONify'

import FeedClientWrapper from '@/app/(authenticated)/feed/_components/Feed/FeedClientWrapper'
import LeftNav from '@/app/(authenticated)/feed/_components/LeftNav'
import RightNav from '@/app/(authenticated)/feed/_components/RightNav'
import Loading from '@/app/loading'

const Page = async () => {
  const jsonOtherUsers = await getOtherUsers().catch((err: any) => {
    console.error(
      'Error happened while getting getOtherUsers() on Feed component: ',
      err
    )
  })

  const jsonInitialPosts = await getPosts().catch((err: any) => {
    console.error(
      'Error happened while getting getPosts() on Feed component: ',
      err
    )
  })

  const otherUsers = deJSONify(jsonOtherUsers)
  const initialPosts = deJSONify(jsonInitialPosts)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-start px-4 pt-14">
      <LeftNav />
      <div className="mx-auto flex-1 px-4 md:px-8">
        <Suspense fallback={<Loading />}>
          <FeedClientWrapper initialPosts={initialPosts} />
        </Suspense>
      </div>
      <RightNav otherUsers={otherUsers} />
    </main>
  )
}

export default Page
