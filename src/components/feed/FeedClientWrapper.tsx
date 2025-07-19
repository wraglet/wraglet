'use client'

import { FormEvent, useEffect, useReducer, useState } from 'react'
import dynamic from 'next/dynamic'
import { IPost } from '@/models/Post'
import { useInfiniteQuery } from '@tanstack/react-query'

const FeedAbly = dynamic(() => import('@/components/feed/FeedAbly'), {
  ssr: false
})

const CreatePost = dynamic(() => import('@/components/feed/CreatePost'), {
  ssr: false
})

const getLimit = () => {
  if (typeof window === 'undefined') return 20 // default to desktop for SSR
  const width = window.innerWidth
  return width < 768 ? 10 : 20
}

const FeedClientWrapper = () => {
  const [limit, setLimit] = useState(getLimit())
  const [showTrending, setShowTrending] = useState(false)
  const [trendingPosts, setTrendingPosts] = useState<IPost[]>([])
  const [loadingTrending, setLoadingTrending] = useState(false)
  const [trendingTopics, setTrendingTopics] = useState<any[]>([])
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

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

  // Post submit handler (calls API, resets state, triggers refetch)
  const submitPost = async (e: FormEvent) => {
    e.preventDefault()
    dispatchState({ isLoading: true })
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, image })
      })
      if (!res.ok) throw new Error('Failed to create post')
      dispatchState({ text: '', image: null })
      refetch() // Refetch feed after posting
    } catch (error) {
      // Optionally show toast
      // toast.error('An error occurred when creating a post')
      console.error('Post creation error:', error)
    } finally {
      dispatchState({ isLoading: false })
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

  // If feed is empty, fetch trending/discover posts
  useEffect(() => {
    if (posts.length === 0 && status === 'success') {
      setShowTrending(true)
      setLoadingTrending(true)
      fetch(`/api/posts?limit=${limit}&feedType=trending`)
        .then((res) => res.json())
        .then((data) => {
          setTrendingPosts(data.posts ?? [])
        })
        .finally(() => setLoadingTrending(false))
    } else {
      setShowTrending(false)
      setTrendingPosts([])
    }
  }, [posts.length, status, limit])

  // Fetch trending posts for a selected topic
  useEffect(() => {
    if (selectedTopic) {
      setLoadingTrending(true)
      fetch(
        `/api/posts?limit=${limit}&feedType=trending&tag=${encodeURIComponent(selectedTopic)}`
      )
        .then((res) => res.json())
        .then((data) => {
          setTrendingPosts(data.posts ?? [])
        })
        .finally(() => setLoadingTrending(false))
    }
  }, [selectedTopic, limit])

  // Fetch suggested users, trending topics, and people you may know for onboarding
  useEffect(() => {
    if (showTrending && trendingPosts.length === 0 && !loadingTrending) {
      setLoadingTopics(true)
      fetch('/api/users/topics-trending')
        .then((res) => res.json())
        .then((data) => {
          setTrendingTopics(data.topics ?? [])
        })
        .finally(() => setLoadingTopics(false))
    } else {
      setTrendingTopics([])
    }
  }, [showTrending, trendingPosts.length, loadingTrending])

  // Optionally, onboarding/suggestions if both are empty
  const showOnboarding =
    showTrending && !loadingTrending && trendingPosts.length === 0

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="space-y-4">
        <CreatePost
          isLoading={isLoading}
          submitPost={submitPost}
          text={text}
          setText={(e) => dispatchState({ text: e.target.value })}
          postImage={image}
          setPostImage={(image) => dispatchState({ image: image })}
        />
        {/* Feed/Onboarding logic below */}
        {!showTrending && (
          <FeedAbly
            initialPosts={posts}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            status={status}
          />
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
            <div className="mb-4 text-center">
              <div className="mb-2">
                <span className="inline-block rounded-full bg-blue-200 px-3 py-1 font-semibold text-blue-800">
                  Showing posts for #{selectedTopic}
                </span>
                <button
                  className="ml-3 rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                  onClick={() => setSelectedTopic(null)}
                >
                  Clear Filter
                </button>
              </div>
              <FeedAbly
                initialPosts={trendingPosts}
                fetchNextPage={() => {}}
                hasNextPage={false}
                isFetchingNextPage={false}
                status={status}
              />
            </div>
          )}
        {showOnboarding && (
          <div className="mx-auto w-full max-w-2xl space-y-8 py-8 text-center">
            <h2 className="mb-2 text-xl font-semibold">Welcome to Wraglet!</h2>
            <p className="mb-4">
              Start by exploring trending topics to personalize your feed.
            </p>

            {/* Trending Topics */}
            <div>
              <h3 className="mb-2 font-semibold">Trending Topics</h3>
              {loadingTopics && <div>Loading topics...</div>}
              {!loadingTopics && trendingTopics.length > 0 && (
                <div className="mb-4 flex flex-wrap justify-center gap-2">
                  {trendingTopics.map((topic) => (
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
              {!loadingTopics && trendingTopics.length === 0 && (
                <div>No trending topics right now.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FeedClientWrapper
