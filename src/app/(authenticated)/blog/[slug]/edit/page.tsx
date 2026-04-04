import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import getCurrentUser from '@/actions/getCurrentUser'
import getDiscoverUsers from '@/actions/getDiscoverUsers'
import type { PublicUser } from '@/interfaces'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Blog from '@/models/Blog'
import type { IBlog } from '@/models/Blog'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

import BlogEditForm from '@/components/blog/BlogEditForm'
import LeftNav from '@/components/feed/LeftNav'
import MobileResponsiveWrapper from '@/components/feed/MobileResponsiveWrapper'
import RightNav from '@/components/feed/RightNav'

import Loading from '@/app/loading'

interface BlogEditPageProps {
  params: Promise<{ slug: string }>
}

const getBlog = async (
  slug: string,
  userId: string
): Promise<IBlog | { error: 'unauthorized' } | null> => {
  try {
    await client()
    initModels()

    const raw = await Blog.findOne({ slug })
      .populate({
        path: 'author',
        select: 'firstName lastName username gender pronoun profilePicture'
      })
      .lean()

    if (!raw || Array.isArray(raw)) {
      return null
    }

    // Check if the current user is the author
    const authorId =
      typeof raw.author === 'object' && raw.author && '_id' in raw.author
        ? String((raw.author as { _id: { toString(): string } })._id)
        : String(raw.author)
    if (authorId !== userId) {
      return { error: 'unauthorized' }
    }

    return convertObjectIdsToStrings(raw) as IBlog
  } catch (error) {
    console.error('Error fetching blog for editing:', error)
    return null
  }
}

const BlogEditPage = async ({ params }: BlogEditPageProps) => {
  const { slug } = await params
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  const blogResult = await getBlog(slug, currentUser._id.toString())

  if (!blogResult) {
    notFound()
  }

  if ('error' in blogResult) {
    redirect(`/blog/${slug}`) // Redirect to view page if not authorized
  }

  const blog = blogResult

  const discoverUsers =
    (await getDiscoverUsers().catch((err: unknown) => {
      console.error(
        'Error happened while getting getDiscoverUsers() on Blog Edit component: ',
        err
      )
      return []
    })) || []

  const uniqueDiscoverUsers = discoverUsers.filter(
    (user: PublicUser, index: number, array: PublicUser[]) =>
      array.findIndex((u) => u._id === user._id) === index
  )

  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-start px-4">
        <LeftNav />
        <div className="mx-auto flex h-[calc(100vh-3.5rem)] flex-1 px-4 md:px-8">
          <div className="w-full overflow-y-auto pt-14 pb-20 lg:pb-4">
            <Suspense fallback={<Loading />}>
              <BlogEditForm blog={blog} />
            </Suspense>
          </div>
        </div>
        <Suspense fallback={<Loading />}>
          <RightNav otherUsers={uniqueDiscoverUsers} />
        </Suspense>
      </main>

      <MobileResponsiveWrapper otherUsers={uniqueDiscoverUsers} />
    </>
  )
}

export default BlogEditPage
