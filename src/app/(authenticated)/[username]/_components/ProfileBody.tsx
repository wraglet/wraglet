'use client'

import { FormEvent, Suspense, useReducer, useState } from 'react'
import getPostsByUsername from '@/actions/getPostsByUsername'
import getUserByUsername from '@/actions/getUserByUsername'
import { IPost } from '@/models/Post'
import useFeedPostsStore from '@/store/feedPosts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useChannel } from 'ably/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaImages } from 'react-icons/fa6'

import CreatePost from '@/components/CreatePost'
import PostClientWrapper from '@/components/PostClientWrapper'
import SharedPost from '@/components/SharedPost'

import AchievementsBadges from '@/app/(authenticated)/[username]/_components/AchievementsBadges'
import PhotoCollection from '@/app/(authenticated)/[username]/_components/PhotoCollection'

type ProfileBodyProps = {
  username: string
  initialPosts: any[] // Changed to any[] to handle both posts and shares
}

const ProfileBody = ({ username, initialPosts }: ProfileBodyProps) => {
  const [showMobilePhotoCollection, setShowMobilePhotoCollection] =
    useState(false)
  const queryClient = useQueryClient()

  const { data: user, isPending } = useQuery({
    queryKey: ['profileUser', username],
    queryFn: () => getUserByUsername(username)
  })

  const reducer = (state: any, action: any) => ({ ...state, ...action })

  const initialState = {
    text: '',
    image: null
  }

  const [{ text, image }, dispatchState] = useReducer(reducer, initialState)

  const { data: userPosts } = useQuery({
    queryKey: ['posts', username],
    queryFn: () => getPostsByUsername(username),
    initialData: initialPosts
  })

  const channel = useChannel('post-channel', (message) => {
    // Handle real-time post updates
    try {
      if (
        message.name === 'post' &&
        message.data.author.username === username
      ) {
        queryClient.setQueryData(
          ['posts', username],
          (oldPosts: any[] | undefined) => {
            if (!oldPosts)
              return [
                {
                  type: 'post',
                  data: message.data,
                  createdAt: message.data.createdAt
                }
              ]
            return [
              {
                type: 'post',
                data: message.data,
                createdAt: message.data.createdAt
              },
              ...oldPosts
            ]
          }
        )
      } else if (
        message.name === 'share' &&
        message.data.sharedBy.username === username
      ) {
        queryClient.setQueryData(
          ['posts', username],
          (oldPosts: any[] | undefined) => {
            if (!oldPosts)
              return [
                {
                  type: 'share',
                  data: message.data,
                  createdAt: message.data.createdAt
                }
              ]
            return [
              {
                type: 'share',
                data: message.data,
                createdAt: message.data.createdAt
              },
              ...oldPosts
            ]
          }
        )
      }

      // Update feed store for both cases
      if (message.name === 'post') {
        useFeedPostsStore
          .getState()
          .setFeedPosts([
            {
              type: 'post',
              data: message.data,
              createdAt: message.data.createdAt
            },
            ...useFeedPostsStore.getState().posts
          ])
      } else if (message.name === 'share') {
        useFeedPostsStore
          .getState()
          .setFeedPosts([
            {
              type: 'share',
              data: message.data,
              createdAt: message.data.createdAt
            },
            ...useFeedPostsStore.getState().posts
          ])
      }
    } catch (error) {
      console.error('Error handling post update:', error)
    }
  })

  const { mutate: mutateSubmitPost, isPending: isLoading } = useMutation({
    mutationFn: ({ text, image }: { text: string; image: string | null }) =>
      axios.post('/api/posts', { text, image }),
    onSuccess: (data) => {
      const newPost = {
        type: 'post',
        data: data.data,
        createdAt: data.data.createdAt
      }
      queryClient.setQueryData(
        ['posts', username],
        (oldPosts: any[] | undefined) =>
          oldPosts ? [newPost, ...oldPosts] : [newPost]
      )
      useFeedPostsStore
        .getState()
        .setFeedPosts([newPost, ...useFeedPostsStore.getState().posts])
      dispatchState({ text: '', image: null })
      toast.success('Posted successfully')
      try {
        channel.publish('post', data.data)
      } catch (error) {
        console.warn('Failed to publish post to Ably:', error)
      }
    },
    onError: () => {
      toast.error('Failed to create post')
    }
  })

  const submitPost = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !image) {
      toast.error('Please enter some text or upload an image')
      return
    }
    mutateSubmitPost({ text, image })
  }

  const renderProfileItem = (item: any, index: number) => {
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
    <>
      <div className="tablet:px-5 mb-6 flex w-full items-start gap-x-10 lg:px-10 xl:w-[1250px] xl:px-0">
        {/* Desktop Photo Collection */}
        <div className="tablet:flex tablet:w-2/5 hidden h-auto flex-col rounded-lg border border-solid border-neutral-200 bg-white drop-shadow-md">
          <PhotoCollection username={username} />
          <AchievementsBadges />
        </div>

        {/* Main Content */}
        <div className="tablet:grow flex w-full flex-col gap-y-4 sm:mx-10 md:mx-auto md:w-[680px]">
          {user?.isCurrentUser && (
            <Suspense fallback={<div>Loading...</div>}>
              <CreatePost
                isLoading={isLoading}
                submitPost={submitPost}
                text={text}
                setText={(e) => dispatchState({ text: e.target.value })}
                postImage={image}
                setPostImage={(image) => dispatchState({ image: image })}
              />
            </Suspense>
          )}
          {isPending && <div>Loading...</div>}
          {userPosts &&
            !isPending &&
            userPosts.map((item: any, index: number) =>
              renderProfileItem(item, index)
            )}
        </div>
      </div>

      {/* Mobile Photo Collection FAB */}
      <button
        onClick={() => setShowMobilePhotoCollection(true)}
        className="tablet:hidden fixed right-20 bottom-20 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl focus:ring-4 focus:ring-purple-200 focus:outline-none lg:hidden"
        aria-label="View Photo Collection"
      >
        <FaImages className="h-5 w-5" />
      </button>

      {/* Mobile Photo Collection Modal */}
      {showMobilePhotoCollection && (
        <div className="tablet:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="fixed inset-x-4 top-1/2 z-50 max-h-[80vh] -translate-y-1/2 overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Photo Collection
              </h2>
              <button
                onClick={() => setShowMobilePhotoCollection(false)}
                className="rounded-full p-2 transition-colors hover:bg-gray-100"
              >
                <span className="sr-only">Close</span>×
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <PhotoCollection username={username} />
              <div className="mt-6">
                <AchievementsBadges />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProfileBody
