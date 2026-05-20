'use client'

import { Suspense, useReducer, useState } from 'react'
import type { ComponentProps } from 'react'
import getPostsByUsername from '@/actions/getPostsByUsername'
import getUserByUsername from '@/actions/getUserByUsername'
import { IPost } from '@/models/Post'
import useFeedPostsStore from '@/store/feedPosts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useChannel } from 'ably/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaImages } from 'react-icons/fa6'

import CreatePost from '@/components/feed/CreatePost'
import PostClientWrapper from '@/components/feed/PostClientWrapper'
import SharedPost from '@/components/feed/SharedPost'
import AchievementsBadges from '@/components/profile/AchievementsBadges'
import PhotoCollection from '@/components/profile/PhotoCollection'
import {
  profileBodyLayoutClassName,
  profileFabIconClassName,
  profileMainColumnClassName,
  profileMobileFabClassName,
  profileMobileModalAchievementsClassName,
  profileMobileModalBackdropClassName,
  profileMobileModalBodyClassName,
  profileMobileModalCloseClassName,
  profileMobileModalHeaderClassName,
  profileMobileModalPanelClassName,
  profileMobileModalTitleClassName,
  profileSidebarClassName
} from '@/components/profile/profileBodyClassNames'

type ProfileSubmitPostHandler = ComponentProps<typeof CreatePost>['submitPost']

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
        useFeedPostsStore.getState().setFeedPosts([
          {
            type: 'post',
            data: message.data,
            createdAt: message.data.createdAt
          },
          ...useFeedPostsStore.getState().posts
        ])
      } else if (message.name === 'share') {
        useFeedPostsStore.getState().setFeedPosts([
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

  const { mutateAsync: mutateSubmitPostAsync, isPending: isLoading } =
    useMutation({
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
        void channel.publish('post', data.data).catch((error: unknown) => {
          console.warn('Failed to publish post to Ably:', error)
        })
      },
      onError: () => {
        toast.error('Failed to create post')
      }
    })

  const submitPost: ProfileSubmitPostHandler = async (e) => {
    e.preventDefault()
    if (!text.trim() && !image) {
      toast.error('Please enter some text or upload an image')
      return
    }
    await mutateSubmitPostAsync({ text, image })
  }

  const renderProfileItem = (item: any) => {
    if (item.type === 'share') {
      return <SharedPost key={`share-${item.data._id}`} share={item.data} />
    } else {
      // Handle both old format (direct post) and new format (wrapped post)
      const postData = item.data || item
      return (
        <PostClientWrapper
          key={`post-${postData._id}`}
          post={postData as IPost}
        />
      )
    }
  }

  return (
    <>
      <div className={profileBodyLayoutClassName}>
        {/* Desktop Photo Collection */}
        <div className={profileSidebarClassName}>
          <PhotoCollection username={username} />
          <AchievementsBadges />
        </div>

        {/* Main Content */}
        <div className={profileMainColumnClassName}>
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
            userPosts.map((item: any) => renderProfileItem(item))}
        </div>
      </div>

      {/* Mobile Photo Collection FAB */}
      <button
        type="button"
        onClick={() => setShowMobilePhotoCollection(true)}
        title="Photo collection"
        className={profileMobileFabClassName}
        aria-label="View Photo Collection"
      >
        <FaImages className={profileFabIconClassName} />
      </button>

      {/* Mobile Photo Collection Modal */}
      {showMobilePhotoCollection && (
        <div className={profileMobileModalBackdropClassName}>
          <div className={profileMobileModalPanelClassName}>
            <div className={profileMobileModalHeaderClassName}>
              <h2 className={profileMobileModalTitleClassName}>
                Photo Collection
              </h2>
              <button
                type="button"
                onClick={() => setShowMobilePhotoCollection(false)}
                className={profileMobileModalCloseClassName}
              >
                <span className="sr-only">Close</span>
                <span aria-hidden={true}>×</span>
              </button>
            </div>
            <div className={profileMobileModalBodyClassName}>
              <PhotoCollection username={username} />
              <div className={profileMobileModalAchievementsClassName}>
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
