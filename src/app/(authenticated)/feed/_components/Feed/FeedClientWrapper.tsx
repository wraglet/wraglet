'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { PostInterface } from '@/interfaces'
import { IPost } from '@/models/Post'
import useFeedPostsStore from '@/store/feedPosts'
import { useInfiniteQuery } from '@tanstack/react-query'

const FeedAbly = dynamic(
  () => import('@/app/(authenticated)/feed/_components/Feed/FeedAbly'),
  { ssr: false }
)

const getLimit = () => {
  if (typeof window === 'undefined') return 10
  const width = window.innerWidth
  if (width < 768) return 10 // mobile
  return 20 // tablet/desktop
}

const FeedClientWrapper = () => {
  const [limit, setLimit] = useState(10)
  const {
    posts,
    setFeedPosts,
    isFeedPostsInitialized,
    setIsFeedPostsInitialized
  } = useFeedPostsStore()

  useEffect(() => {
    setLimit(getLimit())
    const handleResize = () => setLimit(getLimit())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Infinite query for pagination
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
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

  // Hydrate Zustand store only once on first load
  useEffect(() => {
    if (!isFeedPostsInitialized && data?.pages?.length) {
      const allPosts = (data.pages[0]?.posts ?? []) as PostInterface[]
      setFeedPosts(allPosts)
      setIsFeedPostsInitialized(true)
    }
  }, [isFeedPostsInitialized, data, setFeedPosts, setIsFeedPostsInitialized])

  // When fetching next page, append to Zustand store
  useEffect(() => {
    if (isFeedPostsInitialized && data && data.pages && data.pages.length > 1) {
      // Only append posts from the latest page
      const lastPage = data.pages[data.pages.length - 1]
      if (lastPage?.posts && lastPage.posts.length) {
        const existingIds = new Set(posts.map((p: PostInterface) => p._id))
        const newPosts = (lastPage.posts as PostInterface[]).filter(
          (p: PostInterface) => !existingIds.has(p._id)
        )
        if (newPosts.length > 0) {
          setFeedPosts([...posts, ...newPosts])
        }
      }
    }
  }, [data, isFeedPostsInitialized, setFeedPosts, posts])

  // Always render from Zustand, but pass initialPosts for hydration
  return (
    <FeedAbly
      initialPosts={posts as unknown as IPost[]}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      status={status}
    />
  )
}

export default FeedClientWrapper
