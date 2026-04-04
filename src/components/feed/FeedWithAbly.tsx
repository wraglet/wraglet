'use client'

import { FC, startTransition, useEffect, useState } from 'react'
import { IPost } from '@/models/Post'
import { ChannelProvider, useChannel } from 'ably/react'

import PostClientWrapper from '@/components/feed/PostClientWrapper'
import SharedPost from '@/components/feed/SharedPost'

interface FeedWithAblyProps {
  initialPosts: any[] // Changed to any[] to handle both posts and shares
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  status: string
  isTrendingFeed?: boolean // NEW: optional prop
}

const FeedWithAblyContent: FC<FeedWithAblyProps> = ({
  initialPosts,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status,
  isTrendingFeed = false // NEW: default false
}) => {
  // Local posts state for real-time and optimistic updates with deduplication
  const [posts, setPosts] = useState<any[]>(() => {
    // Deduplicate initial posts
    const seen = new Set()
    return initialPosts.filter((post: any) => {
      const id = post._id || post.data?._id
      if (!id || seen.has(id)) return false
      seen.add(id)
      return true
    })
  })

  useEffect(() => {
    const seen = new Set()
    const deduplicatedPosts = initialPosts.filter((post: any) => {
      const id = post._id || post.data?._id
      if (!id || seen.has(id)) return false
      seen.add(id)
      return true
    })
    startTransition(() => {
      setPosts(deduplicatedPosts)
    })
  }, [initialPosts])

  // Use Ably channel for real-time updates
  const { publish } = useChannel('post-channel', (message) => {
    try {
      if (message.name === 'post') {
        // Handle new posts (deduplicate)
        setPosts((prev) => {
          const postExists = prev.some((p: any) => {
            const existingId = p._id || p.data?._id
            return existingId === message.data._id
          })
          if (!postExists) {
            const newPost = {
              type: 'post',
              data: message.data,
              createdAt: message.data.createdAt
            }
            return [newPost, ...prev]
          }
          return prev
        })
      } else if (message.name === 'share') {
        // Handle new shares (deduplicate)
        setPosts((prev) => {
          const shareExists = prev.some((p: any) => {
            const existingId = p._id || p.data?._id
            return existingId === message.data._id
          })
          if (!shareExists) {
            const newShare = {
              type: 'share',
              data: message.data,
              createdAt: message.data.createdAt
            }
            return [newShare, ...prev]
          }
          return prev
        })
      }
    } catch (error) {
      console.error('Error handling Ably message:', error)
    }
  })

  const renderFeedItem = (item: any, index: number) => {
    if (!item) return null

    // Generate unique key that handles duplicates
    const getUniqueKey = (item: any, index: number) => {
      const id = item._id || item.data?._id
      if (!id) return `feed-item-${index}`

      if (item.type === 'share') {
        return `feed-share-${id}-${index}`
      } else {
        return `feed-post-${id}-${index}`
      }
    }

    if (item.type === 'share') {
      return <SharedPost key={getUniqueKey(item, index)} share={item.data} />
    } else {
      // Handle both old format (direct post) and new format (wrapped post)
      const postData = item.data || item
      if (!postData || !postData._id) {
        console.warn('Invalid post data:', postData)
        return null
      }
      return (
        <PostClientWrapper
          key={getUniqueKey(item, index)}
          post={postData as IPost}
        />
      )
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="space-y-4">
        {isTrendingFeed && (
          <div className="py-2 text-center font-semibold text-blue-600">
            Discover Trending Posts
          </div>
        )}
        {posts.map((item: any, index: number) => renderFeedItem(item, index))}
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

// Wrap the component with ChannelProvider
const FeedWithAbly: FC<FeedWithAblyProps> = (props) => {
  return (
    <ChannelProvider channelName="post-channel">
      <FeedWithAblyContent {...props} />
    </ChannelProvider>
  )
}

export default FeedWithAbly
