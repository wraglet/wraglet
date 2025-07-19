import { Suspense } from 'react'
import getCurrentUser from '@/actions/getCurrentUser'
import getDiscoverUsers from '@/actions/getDiscoverUsers'

import FeedNewChatModalWrapper from '@/components/chat/FeedNewChatModalWrapper'
import FeedClientWrapper from '@/components/feed/FeedClientWrapper'
import LeftNav from '@/components/feed/LeftNav'
import MobileResponsiveWrapper from '@/components/feed/MobileResponsiveWrapper'
import RightNav from '@/components/feed/RightNav'

import Loading from '@/app/loading'

const FeedPage = async () => {
  const discoverUsers =
    (await getDiscoverUsers().catch((err: any) => {
      console.error(
        'Error happened while getting getDiscoverUsers() on Feed component: ',
        err
      )
      return [] // Return empty array on error
    })) || [] // Ensure it's always an array

  const currentUser = await getCurrentUser()

  // Debug: Check for duplicates in discoverUsers
  if (discoverUsers && discoverUsers.length > 0) {
    const userIds = discoverUsers.map((user: any) => user._id)
    const uniqueIds = new Set(userIds)
    if (userIds.length !== uniqueIds.size) {
      console.warn(
        'Duplicate users found in discoverUsers:',
        userIds.filter(
          (id: string, index: number) => userIds.indexOf(id) !== index
        )
      )
    }
  }

  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-start px-4">
        <LeftNav />
        <div className="mx-auto flex h-[calc(100vh-3.5rem)] flex-1 px-4 md:px-8">
          <div className="w-full overflow-y-auto pt-14 pb-20 lg:pb-4">
            <Suspense fallback={<Loading />}>
              <FeedClientWrapper />
            </Suspense>
          </div>
        </div>
        <Suspense fallback={<Loading />}>
          <RightNav otherUsers={discoverUsers} />
        </Suspense>
      </main>

      {/* Mobile responsive components */}
      <MobileResponsiveWrapper otherUsers={discoverUsers} />

      <FeedNewChatModalWrapper otherUsers={discoverUsers} />
    </>
  )
}

export default FeedPage
