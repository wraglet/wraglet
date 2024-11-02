'use client'

import React, { FC, FormEvent, useEffect, useReducer, useState } from 'react'
import { PostInterface } from '@/interfaces'
import useFeedPostsStore from '@/store/feedPosts'
import { useChannel } from 'ably/react'
import axios from 'axios'
import toast from 'react-hot-toast'

import CreatePost from '@/components/CreatePost'
import Post from '@/components/Post'

interface FeedBodyInterface {
  initialPosts: PostInterface[]
}

const FeedBody: FC<FeedBodyInterface> = ({ initialPosts }) => {
  const [hydrated, setHydrated] = useState(false)
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

  const { publish } = useChannel('post-channel', (post) => {
    setFeedPosts([post.data, ...posts]) // Update posts with new post
  })

  const submitPost = async (e: FormEvent) => {
    e.preventDefault()

    dispatchState({ isLoading: true })

    axios
      .post('/api/posts', { text, image })
      .then((res: any) => {
        console.log('response: ', res.data)
        publish({
          name: 'post',
          data: res.data
        })
      })
      .catch(() => toast.error('An error occurred when creating a post'))
      .finally(() => dispatchState({ isLoading: false, text: '', image: null }))
  }

  useEffect(() => {
    // This forces a rerender, so the date is rendered
    // the second time but not the first
    setHydrated(true)
  }, [])
  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null
  }

  console.log(posts)

  return (
    <section className="mx-auto my-6 flex h-auto flex-grow justify-center">
      <div className="flex w-full flex-col gap-y-4 xl:w-[600px] 2xl:w-[680px]">
        <CreatePost
          isLoading={isLoading}
          submitPost={submitPost}
          text={text}
          setText={(e) => dispatchState({ text: e.target.value })}
          postImage={image}
          setPostImage={(image) => dispatchState({ image: image })}
        />
        {posts.map((post: PostInterface) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </section>
  )
}

export default FeedBody
