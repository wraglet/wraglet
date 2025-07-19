'use client'

import { FC, useEffect } from 'react'
import { PostInterface } from '@/interfaces'
import { IPost } from '@/models/Post'
import useFeedPostsStore from '@/store/feedPosts'

import PostClientWrapper from '@/components/feed/PostClientWrapper'

interface FeedNoAblyProps {
  initialPosts: IPost[]
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  status: string
}

const FeedNoAbly: FC<FeedNoAblyProps> = ({
  initialPosts,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status
}) => {
  const {
    posts,
    setFeedPosts,
    isFeedPostsInitialized,
    setIsFeedPostsInitialized
  } = useFeedPostsStore()

  useEffect(() => {
    if (!isFeedPostsInitialized) {
      setFeedPosts(initialPosts as unknown as PostInterface[])
      setIsFeedPostsInitialized(true)
    }
  }, [
    initialPosts,
    setFeedPosts,
    setIsFeedPostsInitialized,
    isFeedPostsInitialized
  ])

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="space-y-4">
        {posts.map((post: PostInterface) => (
          <PostClientWrapper
            key={`${post._id}-${post.createdAt}`}
            post={post as unknown as IPost}
          />
        ))}
        {hasNextPage && (
          <button
            className="w-full py-2 text-center text-blue-600 hover:underline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load more'}
          </button>
        )}
        {status === 'pending' && <div>Loading...</div>}
      </div>
    </div>
  )
}

export default FeedNoAbly
