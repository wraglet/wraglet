'use client'

import { FC, FormEvent, useEffect, useReducer } from 'react'
import { PostInterface } from '@/interfaces'
import { IPost } from '@/models/Post'
import useFeedPostsStore from '@/store/feedPosts'
import { ChannelProvider, useChannel } from 'ably/react'
import axios from 'axios'
import toast from 'react-hot-toast'

import CreatePost from '@/components/CreatePost'
import PostClientWrapper from '@/components/PostClientWrapper'
import SharedPost from '@/components/SharedPost'

interface FeedWithAblyProps {
  initialPosts: any[] // Changed to any[] to handle both posts and shares
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  status: string
}

const FeedWithAblyContent: FC<FeedWithAblyProps> = ({
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

  const initialState = {
    text: '',
    image: null,
    isLoading: false
  }

  const [{ text, image, isLoading }, dispatchState] = useReducer(
    (state: any, action: any) => ({ ...state, ...action }),
    initialState
  )

  // Use Ably channel for real-time updates
  const { publish } = useChannel('post-channel', (message) => {
    try {
      if (message.name === 'post') {
        // Handle new posts
        const postExists = posts.some(
          (p: any) => p.type === 'post' && p.data._id === message.data._id
        )
        if (!postExists) {
          const newPost = {
            type: 'post',
            data: message.data,
            createdAt: message.data.createdAt
          }
          setFeedPosts([newPost, ...posts])
        }
      } else if (message.name === 'share') {
        // Handle new shares
        const shareExists = posts.some(
          (p: any) => p.type === 'share' && p.data._id === message.data._id
        )
        if (!shareExists) {
          const newShare = {
            type: 'share',
            data: message.data,
            createdAt: message.data.createdAt
          }

          // Also update the original post's shareCount in the feed
          const updatedPosts = posts.map((post: any) => {
            if (
              post.type === 'post' &&
              post.data._id === message.data.originalPost._id
            ) {
              return {
                ...post,
                data: {
                  ...post.data,
                  shareCount: (post.data.shareCount || 0) + 1
                }
              }
            }
            return post
          })

          setFeedPosts([newShare, ...updatedPosts])
        }
      } else if (message.name === 'post-update') {
        // Handle post updates (like shareCount changes)
        const updatedPosts = posts.map((post: any) => {
          if (post.type === 'post' && post.data._id === message.data.postId) {
            return {
              ...post,
              data: {
                ...post.data,
                shareCount: message.data.shareCount
              }
            }
          }
          return post
        })
        setFeedPosts(updatedPosts)
      }
    } catch (error) {
      console.error('Error handling post update:', error)
    }
  })

  const submitPost = async (e: FormEvent) => {
    e.preventDefault()
    dispatchState({ isLoading: true })

    try {
      const res = await axios.post('/api/posts', { text, image })

      // Update local state first
      const newPost = {
        type: 'post',
        data: res.data,
        createdAt: res.data.createdAt
      }
      setFeedPosts([newPost, ...posts])

      // Publish to Ably channel
      try {
        await publish('post', res.data)
      } catch (err) {
        console.warn('Failed to publish post to Ably:', err)
      }

      dispatchState({ text: '', image: null })
    } catch (error) {
      toast.error('An error occurred when creating a post')
      console.error('Post creation error:', error)
    } finally {
      dispatchState({ isLoading: false })
    }
  }

  const renderFeedItem = (item: any, index: number) => {
    if (item.type === 'share') {
      return (
        <SharedPost key={`share-${item.data._id}-${index}`} share={item.data} />
      )
    } else {
      // Handle both old format (direct post) and new format (wrapped post)
      const postData = item.data || item
      return (
        <PostClientWrapper
          key={`post-${postData._id}-${index}`}
          post={postData as IPost}
        />
      )
    }
  }

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
