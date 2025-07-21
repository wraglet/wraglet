import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import getCurrentUser from '@/actions/getCurrentUser'
import getDiscoverUsers from '@/actions/getDiscoverUsers'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Blog from '@/models/Blog'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

import BlogInteractions from '@/components/blog/BlogInteractions'
import LeftNav from '@/components/feed/LeftNav'
import MobileResponsiveWrapper from '@/components/feed/MobileResponsiveWrapper'
import RightNav from '@/components/feed/RightNav'
import Avatar from '@/components/shared/Avatar'

import Loading from '@/app/loading'

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

const getBlog = async (slug: string) => {
  try {
    await client()
    await initModels()

    const blog = (await Blog.findOne({ slug, status: 'published' })
      .populate({
        path: 'author',
        select: 'firstName lastName username gender pronoun profilePicture'
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
      .lean()) as any

    if (!blog) {
      return null
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } })

    return convertObjectIdsToStrings(blog)
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
    (await getDiscoverUsers().catch((err: any) => {
      console.error(
        'Error happened while getting getDiscoverUsers() on Blog Post component: ',
        err
      )
      return [] // Return empty array on error
    })) || [] // Ensure it's always an array

  // Deduplicate users by _id to prevent duplicate keys
  const uniqueDiscoverUsers = discoverUsers.filter(
    (user: any, index: number, array: any[]) =>
      array.findIndex((u: any) => u._id === user._id) === index
  )

  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-start px-4">
        <LeftNav />
        <div className="mx-auto flex h-[calc(100vh-3.5rem)] flex-1 px-4 md:px-8">
          <div className="w-full overflow-y-auto pt-14 pb-20 lg:pb-4">
            <div className="mx-auto w-full max-w-4xl">
              {/* Header */}
              <div className="mb-8">
                <div className="mb-4">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {blog.category}
                  </span>
                </div>

                <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                  {blog.title}
                </h1>

                <p className="mb-6 text-xl leading-relaxed text-gray-600">
                  {blog.summary}
                </p>

                {/* Author and Meta Info */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                  <div className="flex items-center space-x-4">
                    <Avatar
                      gender={blog.author.gender}
                      src={blog.author.profilePicture?.url || null}
                      size="h-12 w-12"
                    />
                    <div>
                      <Link
                        href={`/${blog.author.username}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {blog.author.firstName} {blog.author.lastName}
                      </Link>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {formatDistanceToNow(
                              new Date(
                                blog.publishedAt || blog.createdAt || Date.now()
                              ),
                              {
                                addSuffix: true
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{blog.readTime} min read</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>{blog.views} views</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interaction Buttons */}
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200">
                      <HeartIcon className="h-5 w-5" />
                      <span>{blog.likes}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              {blog.coverImage?.url && (
                <div className="mb-8 overflow-hidden rounded-lg">
                  <Image
                    src={blog.coverImage.url}
                    alt={blog.title}
                    width={800}
                    height={400}
                    className="h-96 w-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                  className="prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900"
                />
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog Interactions */}
              <Suspense fallback={<Loading />}>
                <BlogInteractions blog={blog} currentUser={currentUser} />
              </Suspense>

              {/* Author Card */}
              <div className="mt-12 rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <Avatar
                    gender={blog.author.gender}
                    src={blog.author.profilePicture?.url || null}
                    size="h-16 w-16"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {blog.author.firstName} {blog.author.lastName}
                    </h3>
                    <p className="text-gray-600">@{blog.author.username}</p>
                    {blog.author.bio && (
                      <p className="mt-2 text-gray-700">{blog.author.bio}</p>
                    )}
                    <Link
                      href={`/${blog.author.username}`}
                      className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
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
