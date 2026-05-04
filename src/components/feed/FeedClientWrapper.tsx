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

import FeedBlogCard from '@/components/feed/FeedBlogCard'
import Button from '@/components/shared/Button'

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
  const {
    data: blogs = [],
    isLoading: isBlogsLoading,
    refetch: refetchBlogs
  } = useQuery({
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
          <div className="mx-auto w-full max-w-2xl space-y-3">
            <div className="rounded-xl border border-sky-200/90 bg-gradient-to-br from-sky-50 via-white to-violet-50/80 p-2.5 shadow-sm ring-1 ring-sky-100/60 sm:p-4">
              <Button
                type="button"
                onClick={openBlogModal}
                className="group flex w-full flex-col items-stretch gap-2 rounded-xl border border-dashed border-sky-300/80 bg-white/70 px-3 py-2.5 text-left transition-all hover:border-sky-400 hover:bg-white hover:shadow-sm sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="flex shrink-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-sm text-white shadow-sm sm:h-10 sm:w-10 sm:text-base">
                    ✍️
                  </div>
                  <div className="min-w-0 flex-1 sm:hidden">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Share your thoughts
                    </h3>
                    <p className="line-clamp-2 text-[11px] leading-snug text-gray-600">
                      Blogs: rich text, cover, categories.
                    </p>
                  </div>
                </div>
                <div className="min-w-0 flex-1 max-sm:hidden">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Share your thoughts
                  </h3>
                  <p className="line-clamp-2 text-xs leading-snug text-gray-600 sm:line-clamp-none">
                    Rich text, cover image, and categories — long-form for your
                    feed.
                  </p>
                </div>
                <svg
                  className="hidden h-5 w-5 shrink-0 text-sky-500 transition-colors group-hover:text-sky-600 sm:block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </Button>
            </div>

            {(() => {
              if (isBlogsLoading) {
                return (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div
                        key={`skeleton-${i}`}
                        className="animate-pulse rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:rounded-lg"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <div className="h-9 w-9 rounded-full bg-gray-200" />
                          <div className="flex-1">
                            <div className="mb-1 h-3.5 w-28 rounded bg-gray-200" />
                            <div className="h-3 w-16 rounded bg-gray-200" />
                          </div>
                        </div>
                        <div className="mb-3 h-36 rounded-md bg-gray-200" />
                        <div className="mb-2 h-4 w-full max-w-xs rounded bg-gray-200" />
                        <div className="mb-3 h-3 w-full rounded bg-gray-200" />
                        <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
                          <div className="flex gap-3">
                            <div className="h-3 w-12 rounded bg-gray-200" />
                            <div className="h-3 w-10 rounded bg-gray-200" />
                          </div>
                          <div className="h-7 w-16 rounded-full bg-gray-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }

              if (blogs.length > 0) {
                return (
                  <div className="space-y-3">
                    {blogs.map((blog: IBlog) => (
                      <FeedBlogCard key={blog._id} blog={blog} />
                    ))}
                  </div>
                )
              }

              return (
                <div className="rounded-lg border border-neutral-200 bg-white py-8 text-center shadow-sm sm:rounded-lg">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100/90 ring-2 ring-sky-200/60">
                    <span className="text-xl" aria-hidden>
                      📝
                    </span>
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold text-gray-900">
                    No blogs yet
                  </h3>
                  <p className="mx-auto mb-4 max-w-sm px-4 text-sm leading-snug text-gray-600">
                    Be the first to share a post with the community.
                  </p>
                  <Button
                    onClick={openBlogModal}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:from-sky-600 hover:to-sky-700"
                    type="button"
                  >
                    ✍️ Write your first blog
                  </Button>
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
          <div className="mx-auto w-full max-w-2xl space-y-4">
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
            {/* Show blogs in unified feed — section label matches `RightNav` widgets */}
            {blogs.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-gray-900">
                  Recent Blogs
                </h2>
                <div className="space-y-3">
                  {blogs.slice(0, 3).map((blog: IBlog) => (
                    <FeedBlogCard key={blog._id} blog={blog} />
                  ))}
                </div>
                <div className="pt-1 text-center">
                  <Link
                    href="?tab=blogs"
                    className="text-xs font-medium text-[#0EA5E9] hover:text-sky-700"
                  >
                    View all blogs →
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
                  {trendingTopicsData && trendingTopicsData.length > 0 && (
                    <div className="mb-4 flex flex-wrap justify-center gap-2">
                      {trendingTopicsData.map((topic) => (
                        <Button
                          key={topic.tag}
                          type="button"
                          className={`inline-block cursor-pointer rounded-full px-3 py-1 hover:bg-blue-200 ${selectedTopic === topic.tag ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}
                          onClick={() => setSelectedTopic(topic.tag)}
                        >
                          #{topic.tag}
                        </Button>
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
            <div className="flex min-h-[100dvh] items-center justify-center px-2 py-3 sm:min-h-full sm:p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="relative flex max-h-[min(92dvh,100svh)] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl transition-all max-sm:rounded-lg sm:max-h-[90dvh]">
                  <Button
                    type="button"
                    onClick={closeBlogModal}
                    className="absolute top-2 right-2 z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none sm:top-4 sm:right-4"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                  <div className="max-h-[min(92dvh,100svh)] min-h-0 flex-1 overflow-y-auto sm:max-h-[90dvh]">
                    <BlogCreateForm
                      onSuccess={() => {
                        closeBlogModal()
                        void refetchBlogs()
                      }}
                    />
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
