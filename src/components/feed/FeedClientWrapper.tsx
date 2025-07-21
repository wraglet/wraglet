'use client'

import { FormEvent, useEffect, useReducer, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { IBlog } from '@/models/Blog'
import { IPost } from '@/models/Post'
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
  const showModal = searchParams.get('modal') === 'create'

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [showBlogModal, setShowBlogModal] = useState(false)

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

  // Handle modal state from URL
  useEffect(() => {
    setShowBlogModal(showModal && currentTab === 'blogs')
  }, [showModal, currentTab])

  // Listen for URL changes triggered by the CreatePost button
  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search)
      const tab = searchParams.get('tab') || 'all'
      const modal = searchParams.get('modal') === 'create'
      setShowBlogModal(modal && tab === 'blogs')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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

  // Blog modal handlers
  const openBlogModal = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('modal', 'create')
    window.history.pushState({}, '', url.toString())
    setShowBlogModal(true)
  }

  const closeBlogModal = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('modal')
    window.history.pushState({}, '', url.toString())
    setShowBlogModal(false)
  }

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
                initialPosts={posts}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
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
              </div>
            )}

            {showTrending &&
              !loadingTrending &&
              trendingPosts.length > 0 &&
              !selectedTopic && (
                <FeedAbly
                  initialPosts={trendingPosts}
                  fetchNextPage={() => {}}
                  hasNextPage={false}
                  isFetchingNextPage={false}
                  status={status}
                />
              )}
            {showTrending &&
              !loadingTrending &&
              trendingPosts.length > 0 &&
              selectedTopic && (
                <FeedAbly
                  initialPosts={trendingPosts}
                  fetchNextPage={() => {}}
                  hasNextPage={false}
                  isFetchingNextPage={false}
                  status={status}
                />
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

  // Infinite query for pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery({
    queryKey: ['feed-posts', limit],
    queryFn: async ({ pageParam }) => {
      const res = await fetch(
        `/api/posts?limit=${limit}&cursor=${pageParam || ''}`
      )
      return res.json()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null
  })

  // Flatten all posts from all pages
  const posts: IPost[] = data?.pages?.flatMap((page) => page.posts ?? []) ?? []

  // Use React Query for trending posts when feed is empty
  const shouldFetchTrending = posts.length === 0 && status === 'success'

  const { data: trendingPostsData, isLoading: loadingTrending } = useQuery({
    queryKey: ['trendingPosts', limit],
    queryFn: async () => {
      const res = await fetch(`/api/posts?limit=${limit}&feedType=trending`)
      const data = await res.json()
      const posts = data.posts ?? []

      // Deduplicate posts by _id to prevent duplicates from API
      const seen = new Set()
      const uniquePosts = posts.filter((post: any) => {
        const id = post._id || post.data?._id
        if (!id || seen.has(id)) return false
        seen.add(id)
        return true
      })

      return uniquePosts
    },
    enabled: shouldFetchTrending
  })

  // Use React Query for trending posts by topic
  const { data: topicTrendingPosts, isLoading: loadingTopicTrending } =
    useQuery({
      queryKey: ['trendingPosts', limit, selectedTopic],
      queryFn: async () => {
        const res = await fetch(
          `/api/posts?limit=${limit}&feedType=trending&tag=${encodeURIComponent(selectedTopic!)}`
        )
        const data = await res.json()
        const posts = data.posts ?? []

        // Deduplicate posts by _id to prevent duplicates from API
        const seen = new Set()
        const uniquePosts = posts.filter((post: any) => {
          const id = post._id || post.data?._id
          if (!id || seen.has(id)) return false
          seen.add(id)
          return true
        })

        return uniquePosts
      },
      enabled: !!selectedTopic
    })

  // Use React Query for trending topics
  const { data: trendingTopicsData } = useQuery({
    queryKey: ['trendingTopics'],
    queryFn: async () => {
      const res = await fetch('/api/users/topics-trending')
      const data = await res.json()
      return data.topics ?? []
    },
    enabled: shouldFetchTrending
  })

  // Determine what to show
  const showTrending = shouldFetchTrending
  const trendingPosts = selectedTopic
    ? topicTrendingPosts || []
    : trendingPostsData || []
  const trendingTopics = trendingTopicsData || []

  // Optionally, onboarding/suggestions if both are empty
  const showOnboarding =
    showTrending && !loadingTrending && trendingPosts.length === 0

  return (
    <>
      {renderTabContent()}

      {/* Blog Creation Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative m-4 max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <button
              onClick={closeBlogModal}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
            >
              ×
            </button>
            <div className="max-h-[90vh] overflow-y-auto">
              <BlogCreateForm onSuccess={closeBlogModal} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FeedClientWrapper
