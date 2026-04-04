import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import getCurrentUser from '@/actions/getCurrentUser'
import getDiscoverUsers from '@/actions/getDiscoverUsers'
import type { PublicUser } from '@/interfaces'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Blog from '@/models/Blog'
import type { IBlog } from '@/models/Blog'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

import BlogInteractionsAbly from '@/components/blog/BlogInteractionsAbly'
import LeftNav from '@/components/feed/LeftNav'
import MobileResponsiveWrapper from '@/components/feed/MobileResponsiveWrapper'
import RightNav from '@/components/feed/RightNav'
import Avatar from '@/components/shared/Avatar'

import Loading from '@/app/loading'

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

type ContentBlock = IBlog['contentBlocks'][number]

const getBlog = async (slug: string): Promise<IBlog | null> => {
  try {
    await client()
    await initModels()

    const raw = await Blog.findOne({ slug, status: 'published' })
      .populate({
        path: 'author',
        select:
          'firstName lastName username gender pronoun profilePicture bio'
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

    // Increment view count
    await Blog.findByIdAndUpdate(raw._id, { $inc: { views: 1 } })

    return convertObjectIdsToStrings(raw) as IBlog
  } catch (error) {
    console.error('Error fetching blog:', error)
    return null
  }
}

const BlogPage = async ({ params }: BlogPageProps) => {
  const { slug } = await params
  const blog = await getBlog(slug)
  const currentUser = await getCurrentUser()

  if (!blog) {
    notFound()
  }

  const discoverUsers =
    (await getDiscoverUsers().catch((err: unknown) => {
      console.error(
        'Error happened while getting getDiscoverUsers() on Blog Post component: ',
        err
      )
      return [] // Return empty array on error
    })) || [] // Ensure it's always an array

  // Filter out the current user and blog author from discover users
  const filteredDiscoverUsers = discoverUsers.filter(
    (user: PublicUser) =>
      user._id !== currentUser?._id && user._id !== blog.author._id
  )

  // Deduplicate users by _id to prevent duplicate keys
  const uniqueDiscoverUsers = filteredDiscoverUsers.filter(
    (user: PublicUser, index: number, array: PublicUser[]) =>
      array.findIndex((u) => u._id === user._id) === index
  )

  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-start px-4">
        <LeftNav />
        <div className="mx-auto flex h-[calc(100vh-3.5rem)] flex-1 px-4 md:px-8">
          <div className="w-full overflow-y-auto pt-14 pb-20 lg:pb-4">
            <div className="mx-auto w-full max-w-4xl rounded-lg bg-white p-6 shadow-sm">
              {/* Header */}
              <div className="mb-6">
                <div className="mb-3">
                  <span className="inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                    {blog.category}
                  </span>
                </div>

                <h1 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
                  {blog.title}
                </h1>

                <p className="mb-4 text-base leading-relaxed text-gray-600">
                  {blog.summary}
                </p>

                {/* Author and Meta Info */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      gender={blog.author.gender}
                      src={blog.author.profilePicture?.url || null}
                      size="h-10 w-10"
                    />
                    <div>
                      <Link
                        href={`/${blog.author.username}`}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {blog.author.firstName} {blog.author.lastName}
                      </Link>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>
                            {(() => {
                              const at = blog.publishedAt || blog.createdAt
                              return at
                                ? formatDistanceToNow(new Date(at), {
                                    addSuffix: true
                                  })
                                : '—'
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>{blog.readTime} min read</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="h-3 w-3" />
                          <span>{blog.views} views</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interaction Buttons */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm text-gray-700">
                      <HeartIcon className="h-4 w-4" />
                      <span>
                        {(blog.reactions?.length ?? 0) > 0
                          ? blog.reactions?.length
                          : blog.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              {blog.coverImage?.url && (
                <div className="mb-6 overflow-hidden rounded-lg">
                  <Image
                    src={blog.coverImage.url}
                    alt={blog.title}
                    width={800}
                    height={400}
                    className="h-64 w-full object-cover md:h-80"
                    priority
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-sm md:prose-base max-w-none">
                {blog.contentBlocks && blog.contentBlocks.length > 0 ? (
                  // Render structured content blocks
                  <div className="space-y-6">
                    {blog.contentBlocks
                      .sort((a: ContentBlock, b: ContentBlock) => a.order - b.order)
                      .map((block: ContentBlock) => {
                        switch (block.type) {
                          case 'text':
                            return (
                              <div
                                key={block.id}
                                dangerouslySetInnerHTML={{
                                  __html: block.content ?? ''
                                }}
                                className="prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
                              />
                            )
                          case 'image':
                            return (
                              <div key={block.id} className="my-6">
                                {block.metadata?.url && (
                                  <div className="overflow-hidden rounded-lg">
                                    <Image
                                      src={block.metadata.url}
                                      alt={block.metadata.alt || 'Blog image'}
                                      width={800}
                                      height={400}
                                      className="w-full object-cover"
                                    />
                                  </div>
                                )}
                                {block.metadata?.caption && (
                                  <p className="mt-2 text-center text-sm text-gray-600">
                                    {block.metadata.caption}
                                  </p>
                                )}
                              </div>
                            )
                          case 'code':
                            return (
                              <div key={block.id} className="my-6">
                                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                                  <code>{block.content}</code>
                                </pre>
                                {block.metadata?.language && (
                                  <div className="mt-2 text-right text-xs text-gray-500">
                                    {block.metadata.language}
                                  </div>
                                )}
                              </div>
                            )
                          case 'video':
                            return (
                              <div key={block.id} className="my-6">
                                {block.metadata?.url && (
                                  <div className="overflow-hidden rounded-lg">
                                    <video
                                      controls
                                      className="w-full"
                                      src={block.metadata.url}
                                    >
                                      Your browser does not support the video
                                      tag.
                                    </video>
                                  </div>
                                )}
                                {block.metadata?.caption && (
                                  <p className="mt-2 text-center text-sm text-gray-600">
                                    {block.metadata.caption}
                                  </p>
                                )}
                              </div>
                            )
                          default:
                            return null
                        }
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No content to display.</p>
                )}
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog Interactions */}
              <Suspense fallback={<Loading />}>
                <BlogInteractionsAbly
                  blog={blog}
                  currentUser={currentUser as PublicUser | null}
                />
              </Suspense>

              {/* Author Card */}
              {currentUser?._id !== blog.author._id && (
                <div className="mt-8 rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <Avatar
                      gender={blog.author.gender}
                      src={blog.author.profilePicture?.url || null}
                      size="h-12 w-12"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {blog.author.firstName} {blog.author.lastName}
                      </h3>
                      <p className="text-xs text-gray-600">
                        @{blog.author.username}
                      </p>
                      {blog.author.bio && (
                        <p className="mt-1 text-xs text-gray-700">
                          {blog.author.bio}
                        </p>
                      )}
                      <Link
                        href={`/${blog.author.username}`}
                        className="mt-3 inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

export default BlogPage
