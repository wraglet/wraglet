'use client'

import { FormEvent, useEffect, useReducer, useState } from 'react'
import dynamic from 'next/dynamic'
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

const getLimit = () => {
  if (typeof window === 'undefined') return 20 // default to desktop for SSR
  const width = window.innerWidth
  return width < 768 ? 10 : 20
}

const FeedClientWrapper = () => {
  const [limit, setLimit] = useState(getLimit())

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
      toast.error('An error occurred when creating a post')
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
            <h2 className="mb-2 text-xl font-semibold">Welcome to Wraglet!</h2>
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
              {trendingTopics && trendingTopics.length === 0 && (
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
