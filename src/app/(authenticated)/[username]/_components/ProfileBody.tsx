'use client'

import { FormEvent, Suspense, useEffect, useReducer, useState } from 'react'
import getPostsByUsername from '@/actions/getPostsByUsername'
import getUserByUsername from '@/actions/getUserByUsername'
import { IPost } from '@/models/Post'
import useFeedPostsStore from '@/store/feedPosts'
import { useQuery } from '@tanstack/react-query'
import { useChannel } from 'ably/react'
import axios from 'axios'
import toast from 'react-hot-toast'

import CreatePost from '@/components/CreatePost'
import PostClientWrapper from '@/components/PostClientWrapper'

import PhotoCollection from '@/app/(authenticated)/[username]/_components/PhotoCollection'

type ProfileBodyProps = {
  username: string
  initialPosts: IPost[]
}

const ProfileBody = ({ username, initialPosts }: ProfileBodyProps) => {
  const reducer = (state: any, action: any) => ({ ...state, ...action })

  const [userPosts, setUserPosts] = useState<IPost[]>(initialPosts)

  // this is used to update the feed posts
  const { posts: feedPosts, setFeedPosts } = useFeedPostsStore()

  const { data: user } = useQuery({
    queryKey: ['user', username],
    queryFn: async () => await getUserByUsername(username)
  })

  const { isPending } = useQuery({
    queryKey: ['posts', username],
    queryFn: async () => {
      const posts = await getPostsByUsername(username)
      setUserPosts(posts as unknown as IPost[])
      return posts
    },
    initialData: initialPosts as any,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })

  const initialState = {
    text: '',
    image: null,
    isLoading: false
  }

  const [{ text, image, isLoading }, dispatchState] = useReducer(
    reducer,
    initialState
  )

  const { channel, publish } = useChannel('post-channel', (post) => {
    try {
      if (post.data.author.username === username) {
        setUserPosts([post.data, ...userPosts])
      }
      setFeedPosts([post.data, ...feedPosts])
    } catch (error) {
      console.error('Error handling post update:', error)
      toast.error('Failed to update posts')
    }
  })

  useEffect(() => {
    if (channel) {
      channel.on('failed', () => {
        toast.error('Connection to posts failed')
      })
      channel.on('suspended', () => {
        toast.error('Posts connection suspended')
      })
      channel.on('attached', () => {
        console.log('Connected to posts channel')
      })
    }
  }, [channel])

  const submitPost = async (e: FormEvent) => {
    e.preventDefault()

    dispatchState({ isLoading: true })

    axios
      .post('/api/posts', { text, image })
      .then((res: any) => {
        publish('post', res.data)

        setFeedPosts([res.data, ...feedPosts])
        setUserPosts([res.data, ...userPosts])
      })
      .catch(() => toast.error('An error occurred when creating a post'))
      .finally(() => dispatchState({ isLoading: false, text: '', image: null }))
  }

  return (
    <div className="tablet:px-5 mb-6 flex w-full items-start gap-x-10 lg:px-10 xl:w-[1250px] xl:px-0">
      <div className="tablet:flex tablet:w-2/5 hidden h-[500px] flex-col rounded-lg border border-solid border-neutral-200 bg-white drop-shadow-md">
        <PhotoCollection
          photos={[]}
          existingPhotos={[
            ...(userPosts
              ?.filter((post) => post.content.images?.[0])
              .map((post) => ({
                url: post.content.images![0].url,
                type: 'post' as const,
                createdAt: post.createdAt || new Date().toISOString()
              })) || []),
            ...(user?.profilePicture?.url
              ? [
                  {
                    url: user.profilePicture.url,
                    type: 'avatar' as const,
                    createdAt: user.updatedAt || new Date().toISOString()
                  }
                ]
              : [])
          ]}
          onUpdatePhotos={(photos) => {
            // TODO: Implement photo collection update
            console.log('Updated photos:', photos)
          }}
        />
      </div>
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
          userPosts.map((post: IPost) => (
            <PostClientWrapper key={post._id} post={post} />
          ))}
      </div>
    </div>
  )
}

export default ProfileBody
