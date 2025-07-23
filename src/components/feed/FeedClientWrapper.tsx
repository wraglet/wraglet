'use client'

import { FormEvent, Fragment, useEffect, useReducer, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { IBlog } from '@/models/Blog'
import { IPost } from '@/models/Post'
import useBlogModalStore from '@/store/blogModal'
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild
} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

const FeedAbly = dynamic(() => import('@/components/feed/FeedAbly'), {
  ssr: false
})

const CreatePost = dynamic(() => import('@/components/feed/CreatePost'), {
  ssr: false
})

const BlogCreateForm = dynamic(
  () => import('@/components/blog/BlogCreateForm'),
  {
    ssr: false
  }
)

const getLimit = () => {
  if (typeof window === 'undefined') return 20 // default to desktop for SSR
  const width = window.innerWidth
  return width < 768 ? 10 : 20
}

const FeedClientWrapper = () => {
  const [limit, setLimit] = useState(getLimit())
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'all'

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const {
    isOpen: showBlogModal,
    openModal: openBlogModal,
    closeModal: closeBlogModal
  } = useBlogModalStore()

  // CreatePost state/logic
  const initialState = {
    text: '',
    image: null,
    isLoading: false
  }
  const [{ text, image, isLoading }, dispatchState] = useReducer(
    (state: any, action: any) => ({ ...state, ...action }),
    initialState
  )

  // Fetch blogs when on blogs tab
  const { data: blogs = [], isLoading: isBlogsLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const response = await axios.get('/api/blogs')
      return response.data.blogs
    },
    enabled: currentTab === 'blogs' || currentTab === 'all'
  })

  // Post submit handler (calls API, resets state, real-time handles feed update)
  const submitPost = async (e: FormEvent) => {
    e.preventDefault()
    dispatchState({ isLoading: true })
    try {
      const res = await axios.post('/api/posts', { text, image })

      // Reset form state
      dispatchState({ text: '', image: null })

      // Show success message - the real-time Ably update will add the post to feed
      toast.success('Post created successfully!')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      dispatchState({ isLoading: false })
    }
  }

  // Fetch posts data
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['posts', limit],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await fetch(
          `/api/posts?page=${pageParam}&limit=${limit}`
        )
        return response.json()
      },
      getNextPageParam: (lastPage) => {
        return lastPage.hasNextPage ? lastPage.nextPage : undefined
      },
      initialPageParam: 1
    })

  // Flatten all posts from all pages
  const posts: IPost[] = data?.pages?.flatMap((page) => page.posts ?? []) ?? []

  // Ensure posts is always an array to prevent runtime errors
  const safePosts = Array.isArray(posts) ? posts : []

  // Get trending data
  const { data: trendingTopics } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const response = await axios.get('/api/users/topics-trending')
      return response.data
    }
  })

  const [showTrending, setShowTrending] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Render content based on current tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'blogs':
        return (
          <div className="mx-auto w-full max-w-2xl space-y-6">
            {/* Blog Creation Button */}
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <button
                onClick={openBlogModal}
                className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-left text-gray-500 transition-colors hover:border-blue-500 hover:text-blue-500"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-lg text-blue-600">✍️</span>
                  </div>
                  <span className="text-sm font-medium">
                    Write a new blog post...
                  </span>
                </div>
              </button>
            </div>

            {/* Blogs List */}
            {isBlogsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-lg bg-white p-6 shadow-sm"
                  >
                    <div className="mb-2 h-4 w-1/4 rounded bg-gray-200"></div>
                    <div className="mb-2 h-6 w-3/4 rounded bg-gray-200"></div>
                    <div className="mb-4 h-4 w-full rounded bg-gray-200"></div>
                    <div className="flex space-x-4">
                      <div className="h-3 w-20 rounded bg-gray-200"></div>
                      <div className="h-3 w-16 rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : blogs.length > 0 ? (
              <div className="space-y-4">
                {blogs.map((blog: IBlog) => (
                  <div
                    key={blog._id}
                    className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {blog.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(
                          blog.createdAt || Date.now()
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="mb-2 cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600">
                      <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h3>
                    <p className="mb-4 line-clamp-2 text-gray-600">
                      {blog.summary}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>👀 {blog.views || 0}</span>
                        <span>❤️ {blog.likes || 0}</span>
                        <span>📝 {blog.readTime}m read</span>
                      </div>
                      <Link href={`/blog/${blog.slug}`}>
                        <button className="text-blue-600 hover:text-blue-800">
                          Read more
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No blogs yet
                </h3>
                <p className="mb-4 text-gray-500">
                  Be the first to share your thoughts with the community!
                </p>
                <button
                  onClick={openBlogModal}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Write your first blog
                </button>
              </div>
            )}
          </div>
        )

      case 'videos':
        return (
          <div className="mx-auto w-full max-w-2xl py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <span className="text-2xl">🎥</span>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Videos coming soon
            </h3>
            <p className="text-gray-500">
              Video sharing feature is under development.
            </p>
          </div>
        )

      case 'events':
        return (
          <div className="mx-auto w-full max-w-2xl py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Events coming soon
            </h3>
            <p className="text-gray-500">
              Event management feature is under development.
            </p>
          </div>
        )

      case 'all':
      default:
        return (
          <div className="mx-auto w-full max-w-2xl space-y-6">
            <CreatePost
              isLoading={isLoading}
              submitPost={submitPost}
              text={text}
              setText={(e) => dispatchState({ text: e.target.value })}
              postImage={image}
              setPostImage={(image) => dispatchState({ image: image })}
            />

            {/* Combined Feed: Posts and Blogs */}
            {!showTrending && (
              <FeedAbly
                initialPosts={safePosts}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage || false}
                isFetchingNextPage={isFetchingNextPage}
                status={status}
              />
            )}

            {/* Show blogs in unified feed */}
            {blogs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Blogs
                </h2>
                {blogs.slice(0, 3).map((blog: IBlog) => (
                  <div
                    key={blog._id}
                    className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Blog • {blog.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(
                          blog.createdAt || Date.now()
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="mb-2 cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600">
                      <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h3>
                    <p className="mb-4 line-clamp-2 text-gray-600">
                      {blog.summary}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>👀 {blog.views || 0}</span>
                        <span>❤️ {blog.likes || 0}</span>
                        <span>📝 {blog.readTime}m read</span>
                      </div>
                      <Link href={`/blog/${blog.slug}`}>
                        <button className="text-blue-600 hover:text-blue-800">
                          Read more
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="text-center">
                  <Link href="?tab=blogs">
                    <button className="text-blue-600 hover:text-blue-800">
                      View all blogs →
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {showOnboarding && (
              <div className="mx-auto w-full max-w-2xl space-y-8 py-8 text-center">
                <h2 className="mb-2 text-xl font-semibold">
                  Welcome to Wraglet!
                </h2>
                <p className="mb-4">
                  Start by exploring trending topics to personalize your feed.
                </p>

                {/* Trending Topics */}
                <div>
                  <h3 className="mb-2 font-semibold">Trending Topics</h3>
                  {!trendingTopics && <div>Loading topics...</div>}
                  {trendingTopics && trendingTopics.length > 0 && (
                    <div className="mb-4 flex flex-wrap justify-center gap-2">
                      {trendingTopics.map((topic: any) => (
                        <span
                          key={topic.tag}
                          className={`inline-block cursor-pointer rounded-full px-3 py-1 hover:bg-blue-200 ${selectedTopic === topic.tag ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}
                          onClick={() => setSelectedTopic(topic.tag)}
                        >
                          #{topic.tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  useEffect(() => {
    const handleResize = () => setLimit(getLimit())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {renderTabContent()}

      {/* Blog Creation Modal */}
      <Transition appear show={showBlogModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeBlogModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
                  <button
                    onClick={closeBlogModal}
                    className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                  <div className="max-h-[90vh] overflow-y-auto">
                    <BlogCreateForm onSuccess={closeBlogModal} />
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default FeedClientWrapper
