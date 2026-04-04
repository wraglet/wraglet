'use client'

import {
  FormEvent,
  Fragment,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { TrendingTopic } from '@/interfaces'
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

import { DEFAULT_GENDER } from '@/data/constants'
import Avatar from '@/components/shared/Avatar'

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
  if (globalThis.window === undefined) return 20 // default to desktop for SSR
  const width = globalThis.window.innerWidth
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
  type CreatePostState = {
    text: string
    image: string | null
    isLoading: boolean
  }
  type CreatePostAction = Partial<CreatePostState>

  const initialState: CreatePostState = {
    text: '',
    image: null,
    isLoading: false
  }
  const [{ text, image, isLoading }, dispatchState] = useReducer(
    (state: CreatePostState, action: CreatePostAction) => ({
      ...state,
      ...action
    }),
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
      await axios.post('/api/posts', { text, image })

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

  // Fetch posts (GET /api/posts uses cursor + nextCursor only; no page index)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['posts', limit],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({ limit: String(limit) })
        if (pageParam) params.set('cursor', pageParam)
        const response = await fetch(`/api/posts?${params.toString()}`)
        return response.json() as Promise<{
          posts?: IPost[]
          nextCursor?: string | null
        }>
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialPageParam: null as null | string
    })

  // Flatten posts only when infinite-query data changes so FeedWithAbly does not
  // reset local state on unrelated parent re-renders (new array reference each render).
  const safePosts = useMemo(() => {
    const posts: IPost[] =
      data?.pages?.flatMap((page) => page.posts ?? []) ?? []
    return Array.isArray(posts) ? posts : []
  }, [data])

  // Get trending data
  const { data: trendingTopicsData } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const response = await axios.get<{
        success: boolean
        topics: TrendingTopic[]
      }>('/api/users/topics-trending')
      return response.data.topics ?? []
    }
  })

  const [showTrending] = useState(false)
  const [showOnboarding] = useState(false)

  // Render content based on current tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'blogs':
        return (
          <div className="mx-auto w-full max-w-2xl space-y-6">
            {/* Enhanced Blog Creation Button */}
            <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-sm">
              <button
                onClick={openBlogModal}
                className="group w-full rounded-xl border-2 border-dashed border-blue-300 p-6 text-left transition-all duration-200 hover:border-blue-500 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transition-transform group-hover:scale-110">
                    <span className="text-xl">✍️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      Share your thoughts
                    </h3>
                    <p className="text-sm text-gray-600 transition-colors group-hover:text-blue-500">
                      Write a blog post and inspire the community
                    </p>
                  </div>
                  <div className="text-blue-500 transition-colors group-hover:text-blue-600">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            {/* Enhanced Blog List */}
            {(() => {
              if (isBlogsLoading) {
                return (
                  <div className="space-y-6">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div
                        key={`skeleton-${i}`}
                        className="animate-pulse rounded-xl bg-white p-6 shadow-sm"
                      >
                        <div className="mb-4 flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div className="flex-1">
                            <div className="mb-1 h-4 w-32 rounded bg-gray-200"></div>
                            <div className="h-3 w-20 rounded bg-gray-200"></div>
                          </div>
                        </div>
                        <div className="mb-4 h-48 rounded-lg bg-gray-200"></div>
                        <div className="mb-2 h-6 w-3/4 rounded bg-gray-200"></div>
                        <div className="mb-4 h-4 w-full rounded bg-gray-200"></div>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-4">
                            <div className="h-4 w-16 rounded bg-gray-200"></div>
                            <div className="h-4 w-12 rounded bg-gray-200"></div>
                            <div className="h-4 w-20 rounded bg-gray-200"></div>
                          </div>
                          <div className="h-8 w-20 rounded bg-gray-200"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }

              if (blogs.length > 0) {
                return (
                  <div className="space-y-6">
                    {blogs.map((blog: IBlog) => (
                      <div
                        key={blog._id}
                        className="overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-lg"
                      >
                        {/* Author Header */}
                        <div className="flex items-center space-x-3 p-6 pb-4">
                          <Avatar
                            gender={blog.author?.gender || DEFAULT_GENDER}
                            src={blog.author?.profilePicture?.url || null}
                            size="h-10 w-10"
                            alt={`${blog.author?.firstName} ${blog.author?.lastName}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/${blog.author?.username}`}
                                className="font-semibold text-gray-900 hover:text-blue-600"
                              >
                                {blog.author?.firstName} {blog.author?.lastName}
                              </Link>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  blog.createdAt || Date.now()
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                @{blog.author?.username}
                              </span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                {blog.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Cover Image */}
                        {blog.coverImage?.url && (
                          <div className="aspect-[16/9] overflow-hidden">
                            <Image
                              src={blog.coverImage.url}
                              alt={blog.title}
                              width={600}
                              height={337}
                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                        )}

                        <div className="p-6 pt-4">
                          <h3 className="mb-3 cursor-pointer text-xl font-bold text-gray-900 transition-colors hover:text-blue-600">
                            <Link href={`/blog/${blog.slug}`}>
                              {blog.title}
                            </Link>
                          </h3>
                          <p className="mb-4 line-clamp-3 leading-relaxed text-gray-600">
                            {blog.summary}
                          </p>

                          {/* Tags */}
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                              {blog.tags
                                .slice(0, 3)
                                .map((tag: string, index: number) => (
                                  <span
                                    key={`tag-${tag}-${index}`}
                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-200"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              {blog.tags.length > 3 && (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                                  +{blog.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Engagement Stats */}
                          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <span className="text-lg">👀</span>
                                <span>{blog.views || 0} views</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-lg">❤️</span>
                                <span>{blog.likes || 0} reactions</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-lg">📖</span>
                                <span>{blog.readTime}m read</span>
                              </div>
                            </div>
                            <Link href={`/blog/${blog.slug}`}>
                              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                                Read more
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }

              return (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    No blogs yet
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-gray-500">
                    Be the first to share your thoughts and insights with the
                    community!
                  </p>
                  <button
                    onClick={openBlogModal}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
                    type="button"
                  >
                    ✍️ Write your first blog
                  </button>
                </div>
              )
            })()}
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
                    className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Cover Image */}
                    {blog.coverImage?.url && (
                      <div className="aspect-[16/9] overflow-hidden">
                        <Image
                          src={blog.coverImage.url}
                          alt={blog.title}
                          width={400}
                          height={225}
                          className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="p-6">
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
                  {!trendingTopicsData && <div>Loading topics...</div>}
                  {trendingTopicsData &&
                    trendingTopicsData.length > 0 && (
                    <div className="mb-4 flex flex-wrap justify-center gap-2">
                      {trendingTopicsData.map((topic) => (
                        <button
                          key={topic.tag}
                          type="button"
                          className={`inline-block cursor-pointer rounded-full px-3 py-1 hover:bg-blue-200 ${selectedTopic === topic.tag ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}
                          onClick={() => setSelectedTopic(topic.tag)}
                        >
                          #{topic.tag}
                        </button>
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
