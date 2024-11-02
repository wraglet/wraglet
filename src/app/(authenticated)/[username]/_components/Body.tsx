'use client'

import React, { FormEvent, useReducer, useState } from 'react'
import { PostInterface } from '@/interfaces'
import { PostDocument } from '@/models/Post'
import useFeedPostsStore from '@/store/feedPosts'
import { useChannel } from 'ably/react'
import axios from 'axios'
import toast from 'react-hot-toast'

import CreatePost from '@/components/CreatePost'
import Post from '@/components/Post'

type Props = {
  initialPosts: PostDocument[]
}

const ProfileBody = ({ initialPosts }: Props) => {
  const reducer = (state: any, action: any) => ({ ...state, ...action })

  const { posts: feedPosts, setFeedPosts } = useFeedPostsStore()

  const [posts, setPosts] = useState<PostInterface[]>(
    initialPosts as unknown as PostInterface[]
  )

  const initialState = {
    text: '',
    image: null,
    isLoading: false
  }

  const [{ text, image, isLoading }, dispatchState] = useReducer(
    reducer,
    initialState
  )

  const { channel } = useChannel('post-channel')

  const submitPost = async (e: FormEvent) => {
    e.preventDefault()

    dispatchState({ isLoading: true })

    axios
      .post('/api/posts', { text, image })
      .then((res: any) => {
        channel.publish({
          name: 'post',
          data: res.data
        })

        setFeedPosts([res.data, ...feedPosts])

        setPosts((posts: PostInterface[]) => [res.data, ...posts])
      })
      .catch(() => toast.error('An error occurred when creating a post'))
      .finally(() => dispatchState({ isLoading: false, text: '', image: null }))
  }
  return (
    <div className="mb-6 flex w-full items-start gap-x-10 tablet:px-5 lg:px-10 xl:w-[1250px] xl:px-0">
      <div className="hidden h-[500px] flex-col rounded-lg border border-solid border-neutral-200 bg-white drop-shadow-md tablet:flex tablet:w-2/5" />
      <div className="flex w-full flex-col gap-y-4 sm:mx-10 md:mx-auto md:w-[680px] tablet:flex-grow">
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
    </div>
  )
}

export default ProfileBody
