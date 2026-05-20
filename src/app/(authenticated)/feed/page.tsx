import { Suspense } from 'react'
import getDiscoverUsers from '@/actions/getDiscoverUsers'
import {
  feedMainLayoutClassName,
  feedScrollContentPaddingBottomClassName,
  mobileMainBottomInsetClassName
} from '@/lib/uiChrome'
import { cn } from '@/lib/utils'

import FeedNewChatModalWrapper from '@/components/chat/FeedNewChatModalWrapper'
import FeedClientWrapper from '@/components/feed/FeedClientWrapper'
import FeedScrollFallback from '@/components/feed/FeedScrollFallback'
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

  // Deduplicate users by _id to prevent duplicate keys
  const uniqueDiscoverUsers = discoverUsers.filter(
    (user: any, index: number, array: any[]) =>
      array.findIndex((u: any) => u._id === user._id) === index
  )

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
      console.warn(
        'Duplicates removed. Original count:',
        discoverUsers.length,
        'Unique count:',
        uniqueDiscoverUsers.length
      )
    }
  }

  return (
    <>
      <main
        className={cn(feedMainLayoutClassName, mobileMainBottomInsetClassName)}
      >
        <LeftNav />
        <div className="mx-auto flex min-h-0 min-w-0 flex-1 flex-col px-0 sm:px-4 md:px-8">
          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto overscroll-y-contain',
              feedScrollContentPaddingBottomClassName
            )}
          >
            <Suspense fallback={<FeedScrollFallback />}>
              <FeedClientWrapper />
            </Suspense>
          </div>
        </div>
        <Suspense fallback={<Loading />}>
          <RightNav otherUsers={uniqueDiscoverUsers} />
        </Suspense>
      </main>

      {/* Mobile responsive components */}
      <MobileResponsiveWrapper otherUsers={uniqueDiscoverUsers} />

      <FeedNewChatModalWrapper otherUsers={uniqueDiscoverUsers} />
    </>
  )
}

export default FeedPage
