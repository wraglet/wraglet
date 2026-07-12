import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Blog from '@/models/Blog'
import type { IBlog } from '@/models/Blog'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

import BlogDetail from '@/components/blog/BlogDetail'

import Loading from '@/app/loading'

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

const getBlog = async (slug: string): Promise<IBlog | null> => {
  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    const raw = await Blog.findOne({ slug })
      .populate({
        path: 'author',
        select: 'firstName lastName username gender pronoun profilePicture bio'
      })
      .populate({
        path: 'reactions',
        populate: {
          path: 'userId',
          select: 'firstName lastName username profilePicture gender'
        }
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'firstName lastName username gender pronoun profilePicture'
        }
      })
      .lean()

    if (!raw || Array.isArray(raw)) {
      return null
    }

    const authorRef = raw.author as
      | { _id: { toString: () => string } }
      | { toString: () => string }
    const authorId =
      authorRef && typeof authorRef === 'object' && '_id' in authorRef
        ? authorRef._id.toString()
        : String(authorRef)
    const isAuthor =
      !!currentUser?._id && authorId === currentUser._id.toString()

    if (raw.status !== 'published' && !isAuthor) {
      return null
    }

    if (raw.status === 'published') {
      await Blog.findByIdAndUpdate(raw._id, { $inc: { views: 1 } })
    }

    return convertObjectIdsToStrings(raw) as IBlog
  } catch (error) {
    console.error('Error fetching blog:', error)
    return null
  }
}

export const generateMetadata = async ({
  params
}: BlogPageProps): Promise<Metadata> => {
  const { slug } = await params
  const blog = await getBlog(slug)

  if (!blog) {
    return { title: 'Blog not found' }
  }

  return {
    title: blog.title,
    description: blog.summary || undefined
  }
}

const BlogPage = async ({ params }: BlogPageProps) => {
  const { slug } = await params
  const blog = await getBlog(slug)
  const currentUser = await getCurrentUser()

  if (!blog) {
    notFound()
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl min-w-0 items-start overflow-x-hidden px-3 sm:px-4">
      <div className="mx-auto flex h-[calc(100vh-3.5rem)] min-h-0 w-full flex-1 flex-col px-0 sm:px-4 md:px-8">
        <div className="w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-14 pb-[max(5rem,calc(4rem+env(safe-area-inset-bottom,0px)))] lg:pb-4">
          <Suspense fallback={<Loading />}>
            <BlogDetail blog={blog} currentUser={currentUser} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

export default BlogPage
