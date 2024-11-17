'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { PostDocument } from '@/models/Post'
import useUserStore from '@/store/user'
import arrGenerator from '@/utils/arrGenerator'
import { formatDistanceToNow } from 'date-fns'
import { FaRegComment, FaRegHeart } from 'react-icons/fa6'
import { LuArrowBigDown, LuArrowBigUp } from 'react-icons/lu'

import Avatar from '@/components/Avatar'
import { ShareIcon } from '@/components/Icons'
import ReactionIcon from '@/components/ReactionIcon'
import { Button } from '@/components/ui/button'

type Props = {
  post: PostDocument
}

const Post = ({ post }: Props) => {
  useEffect(() => {
    import('@lottiefiles/lottie-player')
  })
  const { user } = useUserStore()
  const [isOpenComment, setIsOpenComment] = useState(false)
  const content = useRef<HTMLDivElement | null>(null)

  const [showEmojis, setShowEmojis] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const emojisTimeout = useRef<number | null>(null)
  const emojisRef = useRef<HTMLDivElement | null>(null)

  const reactions = [
    {
      name: 'like',
      ref: useRef(null)
    },
    {
      name: 'love',
      ref: useRef(null)
    },
    {
      name: 'haha',
      ref: useRef(null)
    },
    {
      name: 'wow',
      ref: useRef(null)
    },
    {
      name: 'sad',
      ref: useRef(null)
    },
    {
      name: 'angry',
      ref: useRef(null)
    }
  ]

  const postReactions = post.reactions

  const handlePressStart = () => {
    timeoutRef.current = window.setTimeout(() => {
      setShowEmojis(true)
    }, 500) // Set your desired long press duration
  }

  const handlePressEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setShowEmojis(false)
  }

  const [height, setHeight] = useState<string>('0px')

  useEffect(() => {
    if (isOpenComment) {
      setHeight(`${content.current?.scrollHeight}px`)
    }

    if (!isOpenComment) {
      setHeight('0px')
    }
  }, [isOpenComment])

  const toggleComment = () => {
    setIsOpenComment((prev) => !prev)
    setHeight(isOpenComment ? `${content.current?.scrollHeight}px` : '0px')
  }

  const handleHoverStart = () => {
    emojisTimeout.current = window.setTimeout(() => {
      setShowEmojis(true)
    }, 200) // Delay for showing emojis on hover
  }

  const handleHoverEnd = () => {
    if (emojisTimeout.current) {
      clearTimeout(emojisTimeout.current)
      emojisTimeout.current = null
    }
    setShowEmojis(false)
  }

  const handleEmojiHoverStart = () => {
    if (emojisTimeout.current) {
      clearTimeout(emojisTimeout.current)
      emojisTimeout.current = null
    }
    setShowEmojis(true)
  }

  const handleEmojiHoverEnd = () => {
    setShowEmojis(false)
  }

  const handleReaction = async (type: string) => {
    try {
      const response = await fetch(`/api/posts/${post._id}/react`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        // You can handle success, e.g., update the UI
        console.log(`Reaction '${type}' added successfully`)
      } else {
        // Handle error
        console.error('Failed to add reaction:', response.statusText)
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  return (
    <div className="flex w-full">
      <div className="flex w-full items-start justify-between gap-x-2 border border-solid border-neutral-200 bg-white px-4 py-3 drop-shadow-md sm:rounded-lg">
        <div className="relative block">
          <Avatar
            gender={post.author?.gender}
            src={post.author.profilePicture?.url!}
          />
        </div>
        <div className="flex flex-grow flex-col justify-start gap-y-5">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-baseline space-x-1">
              <h3 className={`text-sm font-bold leading-none`}>
                {post.author.firstName} {post.author.lastName}
              </h3>
              <svg
                className="self-center"
                width="2"
                height="3"
                viewBox="0 0 2 3"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="1" cy="1.85547" r="1" fill="#4B5563" />
              </svg>
              {post.createdAt && (
                <h4 className="text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(post.createdAt.toString()), {
                    addSuffix: true
                  })}
                </h4>
              )}
            </div>
            {post.content.text && (
              <p className="text-xs text-gray-600">{post.content.text}</p>
            )}

            {post.content.images
              ? post.content.images.map((image) => (
                  <div
                    key={image.key}
                    className="my-3 block overflow-hidden rounded-md"
                  >
                    <Image
                      src={image.url}
                      alt="Post Image"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      width={1}
                      height={1}
                      style={{
                        height: 'auto',
                        width: '100%'
                      }}
                    />
                  </div>
                ))
              : null}
          </div>
          <div className="z-10 flex items-center justify-between bg-white">
            <div className="flex items-center gap-1 rounded-full border border-solid border-gray-400 px-2 py-0.5">
              <LuArrowBigUp className="cursor-pointer text-xs text-gray-600" />
              <span className="cursor-pointer text-xs text-gray-600">12</span>
              <LuArrowBigDown className="cursor-pointer text-xs text-gray-600" />
            </div>
            <div className="flex items-center gap-1 rounded-full border border-solid border-gray-400 px-2 py-0.5">
              <FaRegComment
                className="cursor-pointer text-xs text-gray-600"
                onClick={toggleComment}
              />
            </div>
            <div
              role="button"
              tabIndex={0}
              className="relative flex items-center gap-1 rounded-full border border-solid border-gray-400 px-2 py-0.5"
              onMouseEnter={handleHoverStart}
              onMouseLeave={handleHoverEnd}
            >
              {postReactions &&
              postReactions.find(
                (reaction) => reaction.userId._id === user?._id
              ) ? (
                <ReactionIcon
                  type={
                    postReactions.find(
                      (reaction) => reaction.userId._id === user?._id
                    )!.type
                  }
                  onClick={() => handleReaction('heart')}
                />
              ) : (
                <FaRegHeart
                  className="cursor-pointer text-xs text-gray-600"
                  onClick={() => handleReaction('heart')}
                />
              )}

              <FaRegHeart
                className="cursor-pointer text-xs text-gray-600"
                onClick={() => handleReaction('heart')}
              />

              {showEmojis && (
                <div
                  onMouseEnter={handleEmojiHoverStart}
                  onMouseLeave={handleEmojiHoverEnd}
                  ref={emojisRef}
                  className="absolute -top-8 flex w-fit -translate-x-9 -translate-y-0.5 gap-1 rounded-full border border-solid border-gray-400 bg-white p-2 px-2 py-0.5"
                >
                  {reactions.map((reaction) => (
                    <lottie-player
                      key={reaction.name}
                      id={reaction.name}
                      ref={reaction.ref}
                      autoplay
                      loop
                      mode="normal"
                      src={`/lottie/${reaction.name}.json`}
                      onClick={() => handleReaction(reaction.name)}
                      style={{ width: '24px', height: '24px' }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-full border border-solid border-gray-400 px-2 py-0.5">
              <ShareIcon className="cursor-pointer text-xs text-gray-600" />
            </div>
          </div>

          <div
            style={{ maxHeight: `${height}` }}
            ref={content}
            className={`${
              isOpenComment ? 'border-t border-solid border-[#E7ECF0]' : '-mt-6'
            } flex w-full flex-col gap-4 overflow-hidden pt-2 transition-all duration-300 ease-in-out`}
          >
            <div className="flex items-center gap-2">
              <Avatar
                gender={user?.gender}
                size="h-6 w-6"
                src={user?.profilePicture?.url!}
              />
              <div className="flex-1">
                <input
                  type="text"
                  className="h-[30px] w-full rounded-full bg-[#E7ECF0] px-3 text-xs outline-none"
                  placeholder="Comment something..."
                />
              </div>
            </div>
          </div>
        </div>
        <Button type="button" className="flex items-center gap-0.5">
          {arrGenerator(3).map((i: number) => (
            <span className="h-0.5 w-0.5 rounded-full bg-gray-700" key={i} />
          ))}
        </Button>
      </div>
    </div>
  )
}

export default Post
