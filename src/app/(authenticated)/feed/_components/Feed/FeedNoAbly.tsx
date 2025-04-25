'use client'

import { FC, FormEvent, useEffect, useReducer } from 'react'
import { PostInterface } from '@/interfaces'
import { IPost } from '@/models/Post'
import useFeedPostsStore from '@/store/feedPosts'
import axios from 'axios'
import toast from 'react-hot-toast'

import CreatePost from '@/components/CreatePost'
import PostClientWrapper from '@/components/PostClientWrapper'

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

  const initialState = {
    text: '',
    image: null,
    isLoading: false
  }

  const [{ text, image, isLoading }, dispatchState] = useReducer(
    (state: any, action: any) => ({ ...state, ...action }),
    initialState
  )

  const submitPost = async (e: FormEvent) => {
    e.preventDefault()
    dispatchState({ isLoading: true })

    try {
      const res = await axios.post('/api/posts', { text, image })

      // Update local state
      setFeedPosts([res.data, ...posts])

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
