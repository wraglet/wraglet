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

interface FeedWithAblyProps {
  initialPosts: IPost[]
}

const FeedWithAblyContent: FC<FeedWithAblyProps> = ({ initialPosts }) => {
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
  const { publish } = useChannel('post-channel', (post) => {
    try {
      // Check if the post already exists in the feed
      const postExists = posts.some((p) => p._id === post.data._id)
      if (!postExists) {
        setFeedPosts([post.data, ...posts])
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
      const newPost = res.data
      setFeedPosts([newPost, ...posts])

      // Publish to Ably channel
      try {
        await publish('post', newPost)
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
        {posts.map((post: PostInterface) => (
          <PostClientWrapper
            key={`${post._id}-${post.createdAt}`}
            post={post as unknown as IPost}
          />
        ))}
      </div>
    </div>
  )
}

// Wrap the component with ChannelProvider
const FeedWithAbly: FC<FeedWithAblyProps> = ({ initialPosts }) => {
  return (
    <ChannelProvider channelName="post-channel">
      <FeedWithAblyContent initialPosts={initialPosts} />
    </ChannelProvider>
  )
}

export default FeedWithAbly
