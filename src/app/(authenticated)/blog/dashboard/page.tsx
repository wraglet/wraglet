import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import getCurrentUser from '@/actions/getCurrentUser'
import getDiscoverUsers from '@/actions/getDiscoverUsers'
import type { PublicUser } from '@/interfaces'

import BlogDashboard from '@/components/blog/BlogDashboard'
import LeftNav from '@/components/feed/LeftNav'
import MobileResponsiveWrapper from '@/components/feed/MobileResponsiveWrapper'
import RightNav from '@/components/feed/RightNav'

import Loading from '@/app/loading'

const BlogDashboardPage = async () => {
  const discoverUsers =
    (await getDiscoverUsers().catch((err: unknown) => {
      console.error(
        'Error happened while getting getDiscoverUsers() on Blog Dashboard component: ',
        err
      )
      return [] // Return empty array on error
    })) || [] // Ensure it's always an array

  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Deduplicate users by _id to prevent duplicate keys
  const uniqueDiscoverUsers = discoverUsers.filter(
    (discoverUser: PublicUser, index: number, array: PublicUser[]) =>
      array.findIndex((u) => u._id === discoverUser._id) === index
  )

  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-start px-4">
        <LeftNav />
        <div className="mx-auto flex h-[calc(100vh-3.5rem)] flex-1 px-4 md:px-8">
          <div className="w-full overflow-y-auto pt-14 pb-20 lg:pb-4">
            <Suspense fallback={<Loading />}>
              <BlogDashboard user={user as PublicUser} />
            </Suspense>
          </div>
        </div>
        <Suspense fallback={<Loading />}>
          <RightNav otherUsers={uniqueDiscoverUsers} />
        </Suspense>
      </main>

      {/* Mobile responsive components */}
      <MobileResponsiveWrapper otherUsers={uniqueDiscoverUsers} />
    </>
  )
}

export default BlogDashboardPage
