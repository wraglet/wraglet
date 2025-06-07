'use client'

import { FormEvent, Fragment, Key, useEffect, useRef, useState } from 'react'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useFollow } from '@/lib/hooks/useFollow'
import { IComment } from '@/models/Comment'
import { IPost } from '@/models/Post'
import useUserStore from '@/store/user'
import {
  arrow,
  flip,
  FloatingArrow,
  offset,
  shift,
  useFloating
} from '@floating-ui/react'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition
} from '@headlessui/react'
import { useChannel } from 'ably/react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { FaRegComment, FaRegHeart } from 'react-icons/fa6'
import { HiOutlineEllipsisHorizontal } from 'react-icons/hi2'
import { LuArrowBigDown, LuArrowBigUp } from 'react-icons/lu'

import Avatar from '@/components/Avatar'
import CommentComponent from '@/components/Comment'
import { ShareIcon } from '@/components/Icons'
import ReactionIcon from '@/components/ReactionIcon'

// Dynamic import for ShareModal
const ShareModalAbly = dynamic(() => import('@/components/ShareModalAbly'), {
  ssr: false
})

interface User {
  _id: string
  firstName: string
  lastName: string
  username: string
  profilePicture?: {
    url: string
  }
}

interface ReactionGroup {
  type: string
  count: number
  users: User[]
}

interface PostProps {
  post: IPost
}

const Post = ({ post: initialPost }: PostProps) => {
  useEffect(() => {
    import('@lottiefiles/lottie-player')
  }, [])

  const { user } = useUserStore()
  const [post, setPost] = useState<IPost>(initialPost)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [comment, setComment] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [postComments, setPostComments] = useState<IComment[]>(
    (initialPost.comments || []).filter(
      (comment): comment is IComment =>
        typeof comment !== 'string' && '_id' in comment
    )
  )
  // Keep track of comment IDs we've seen
  const commentIdsRef = useRef(
    new Set(postComments.map((c) => c._id.toString()))
  )

  // Try to use Ably channel for both comments and reactions
  const channel = useChannel(`post-${post._id}`, (message) => {
    if (message.name === 'comment') {
      const newComment = message.data
      // Only add the comment if we haven't seen it before
      if (!commentIdsRef.current.has(newComment._id.toString())) {
        commentIdsRef.current.add(newComment._id.toString())
        setPostComments((prev) => [...prev, newComment])
        setShowCommentInput(true)
      }
    } else if (message.name === 'reaction') {
      // Update the post with new reaction data
      setPost(message.data)
    } else if (message.name === 'vote') {
      setPost(message.data)
    }
  })

  const [showEmojis, setShowEmojis] = useState(false)
  const arrowRef = useRef(null)
  const { refs, floatingStyles, context } = useFloating({
    open: showEmojis,
    onOpenChange: setShowEmojis,
    middleware: [
      offset(10),
      flip({ padding: 10 }),
      shift(),
      arrow({ element: arrowRef })
    ],
    placement: 'top'
  })

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

  const [height, setHeight] = useState<string>('0px')

  useEffect(() => {
    if (showCommentInput && content.current) {
      setHeight(`${content.current.scrollHeight}px`)
    } else {
      setHeight('0px')
    }
  }, [showCommentInput, post.comments])

  const toggleComment = () => {
    setShowCommentInput((prev) => !prev)
    setHeight(showCommentInput ? `${content.current?.scrollHeight}px` : '0px')
  }

  const handleReactionClick = () => {
    setShowEmojis(!showEmojis)
  }

  const handleReaction = async (type: string) => {
    if (!user) return

    try {
      // Check if user has already reacted with this type
      const existingReaction = post.reactions.find(
        (reaction) =>
          reaction.userId &&
          reaction.userId._id === user._id &&
          reaction.type === type
      )

      if (existingReaction) {
        // If clicking the same reaction type, remove it
        await removeReaction()
      } else {
        // Either add new reaction or update existing one
        const response = await axios.patch(`/api/posts/${post._id}/react`, {
          type
        })

        if (response.status !== 200) {
          throw new Error('Failed to update reaction')
        }

        const updatedPost = response.data
        setPost(updatedPost)

        if (channel && channel.publish) {
          await channel.publish({
            name: 'reaction',
            data: updatedPost
          })
        }
      }
    } catch (error) {
      console.error('Error updating reaction:', error)
      toast.error('Failed to update reaction')
    }
  }

  const removeReaction = async () => {
    try {
      const response = await axios.delete(`/api/posts/${post._id}/react`)

      if (response.status !== 200) {
        throw new Error('Failed to remove reaction')
      }

      const updatedPost = response.data
      setPost(updatedPost)

      if (channel && channel.publish) {
        await channel.publish({
          name: 'reaction',
          data: updatedPost
        })
      }
    } catch (error) {
      console.error('Error removing reaction:', error)
      toast.error('Failed to remove reaction')
    }
  }

  // Get reaction counts by type
  const reactionCounts =
    post.reactions?.reduce(
      (acc, reaction) => {
        acc[reaction.type] = (acc[reaction.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    ) || {}

  // Get user's reaction if any
  const userReaction =
    user &&
    post.reactions?.find(
      (reaction) => reaction.userId && reaction.userId._id === user._id
    )

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      const response = await axios.post(`/api/posts/${post._id}/comment`, {
        content: comment
      })

      const newComment = response.data

      // Add the comment to local state
      setPostComments((prev) => [...prev, newComment])
      // Add the comment ID to the set to prevent Ably double-add
      commentIdsRef.current.add(newComment._id.toString())
      setComment('')
      setShowCommentInput(true)

      // Publish to Ably channel
      if (channel && channel.publish) {
        await channel.publish('comment', newComment)
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    }
  }

  const isCommentDocument = (
    comment: IComment | string
  ): comment is IComment => {
    return (
      typeof comment === 'object' &&
      comment !== null &&
      '_id' in comment &&
      'content' in comment &&
      'author' in comment
    )
  }

  const content = useRef<HTMLDivElement | null>(null)

  const [reactionGroups, setReactionGroups] = useState<ReactionGroup[]>([])

  useEffect(() => {
    if (!post.reactions) return

    const groups: Record<string, ReactionGroup> = {}

    // Initialize groups
    post.reactions.forEach((reaction) => {
      if (!groups[reaction.type]) {
        groups[reaction.type] = {
          type: reaction.type,
          count: 0,
          users: []
        }
      }
      groups[reaction.type].count++

      // Add user to the group if they reacted - add null safety checks
      if (user && reaction.userId && reaction.userId._id === user._id) {
        const userData = reaction.userId as User
        groups[reaction.type].users.push(userData)
      }
    })

    setReactionGroups(Object.values(groups))
  }, [post.reactions, user])

  // Get current user's vote
  const userVote = post.votes?.find(
    (vote) => vote.userId === user?._id
  )?.voteType

  // Calculate upvotes and downvotes
  const upvotes =
    post.votes?.filter((vote) => vote.voteType === 'upvote').length || 0
  const downvotes =
    post.votes?.filter((vote) => vote.voteType === 'downvote').length || 0
  const voteDisplay = (
    <span>
      <span className="text-green-600">+{upvotes}</span>
      {' | '}
      <span className="text-red-600">-{downvotes}</span>
    </span>
  )

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/posts/${post._id}/vote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ voteType })
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      const updatedPost = await response.json()
      setPost(updatedPost)

      // Publish vote update to Ably
      try {
        await channel.publish('vote', updatedPost)
      } catch (err) {
        console.warn('Failed to publish vote to Ably:', err)
      }
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Failed to vote')
    }
  }
  const isAuthor = user?._id === post.author._id
  const { isFollowing, follow, loading } = useFollow(post.author._id)

  // Share functionality
  const handleShare = () => {
    setShowShareModal(true)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`
    await copyToClipboard(postUrl)
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
        <div className="flex grow flex-col justify-start gap-y-5">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-baseline space-x-1">
              <h3 className={`text-sm leading-none font-bold`}>
                {post.author.firstName} {post.author.lastName}
              </h3>
              {!isAuthor &&
                (isFollowing ? (
                  <span className="ml-2 text-xs font-semibold text-sky-600">
                    Following
                  </span>
                ) : (
                  <button
                    className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-600 hover:bg-sky-500 hover:text-white disabled:opacity-60"
                    onClick={() => follow()}
                    disabled={loading}
                  >
                    Follow
                  </button>
                ))}
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
              <Link
                href={`/post/${post._id}`}
                className="-m-1 block rounded-md p-1 transition-colors hover:bg-gray-50"
              >
                <p className="cursor-pointer text-xs text-gray-600">
                  {post.content.text}
                </p>
              </Link>
            )}

            {post.content.images
              ? post.content.images.map(
                  (
                    image: {
                      key: Key | null | undefined
                      url: string | StaticImport
                    },
                    index: number
                  ) => (
                    <div
                      key={image.key || `image-${index}`}
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
                  )
                )
              : null}
          </div>

          {/* Interaction counts section */}
          <div className="flex items-center justify-between border-b border-solid border-[#E7ECF0] pb-2">
            <div className="flex items-center gap-x-1">
              {Object.keys(reactionCounts).length > 0 && (
                <div className="flex items-center gap-x-1">
                  <div className="flex -space-x-1">
                    {reactionGroups.slice(0, 3).map((group, index) => (
                      <div
                        key={`${group.type}-${index}`}
                        className="relative h-4 w-4 rounded-full bg-white ring-2 ring-white"
                      >
                        {/* @ts-ignore */}
                        <lottie-player
                          id={`reaction-display-${group.type}-${post._id}`}
                          autoplay
                          loop
                          mode="normal"
                          src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/lottie/${group.type}.json`}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {Object.values(reactionCounts).reduce((a, b) => a + b, 0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-x-3 text-xs text-gray-500">
              {postComments.length > 0 && (
                <span>{postComments.length} comments</span>
              )}
              {voteDisplay}
              <span>2 shares</span>
            </div>
          </div>

          <div className="z-10 flex items-center justify-between bg-white">
            <div className="group relative">
              <div className="flex items-center gap-1 rounded-full border border-solid border-gray-400 px-2 py-0.5">
                <LuArrowBigUp
                  className={`cursor-pointer text-xs ${userVote === 'upvote' ? 'text-green-600' : 'text-gray-600'}`}
                  onClick={() => handleVote('upvote')}
                />
                <div className="h-3 w-[1px] bg-gray-300" />
                <LuArrowBigDown
                  className={`cursor-pointer text-xs ${userVote === 'downvote' ? 'text-red-600' : 'text-gray-600'}`}
                  onClick={() => handleVote('downvote')}
                />
              </div>
            </div>

            <div className="group relative">
              <div className="flex items-center gap-1 rounded-full border border-solid border-gray-400 px-2 py-0.5">
                <FaRegComment
                  className="cursor-pointer text-xs text-gray-600"
                  onClick={toggleComment}
                />
              </div>
            </div>

            <div className="group relative">
              <div
                ref={refs.setReference}
                role="button"
                tabIndex={0}
                className="flex items-center gap-1 rounded-full border border-solid border-gray-400 px-2 py-0.5"
                onClick={handleReactionClick}
              >
                {userReaction ? (
                  <ReactionIcon
                    type={userReaction.type}
                    onClick={() => removeReaction()}
                  />
                ) : (
                  <FaRegHeart className="cursor-pointer text-xs text-gray-600" />
                )}
              </div>

              {showEmojis && (
                <div
                  ref={refs.setFloating}
                  style={floatingStyles}
                  className="z-50 flex w-fit gap-1 rounded-lg border border-solid border-gray-200 bg-white p-2 shadow-lg"
                >
                  <FloatingArrow
                    ref={arrowRef}
                    context={context}
                    className="fill-white"
                  />
                  {reactions.map((reaction, index) => (
                    <button
                      key={`${reaction.name}-${index}`}
                      className="cursor-pointer transition-transform hover:scale-125"
                      onClick={() => {
                        handleReaction(reaction.name)
                        setShowEmojis(false)
                      }}
                    >
                      {/* @ts-ignore */}
                      <lottie-player
                        id={`reaction-picker-${reaction.name}-${post._id}`}
                        autoplay
                        loop
                        mode="normal"
                        src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/lottie/${reaction.name}.json`}
                        style={{ width: '24px', height: '24px' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="group relative">
              <div
                className="flex cursor-pointer items-center gap-1 rounded-full border border-solid border-gray-400 px-2 py-0.5 transition-colors hover:bg-gray-50"
                onClick={handleShare}
              >
                <ShareIcon className="text-xs text-gray-600" />
              </div>
            </div>
          </div>

          <div
            style={{ maxHeight: showCommentInput ? 'none' : '0px' }}
            ref={content}
            className={`${
              showCommentInput
                ? 'border-t border-solid border-[#E7ECF0] pt-4'
                : 'hidden'
            } flex w-full flex-col gap-4 overflow-hidden transition-all duration-300 ease-in-out`}
          >
            <div className="flex flex-col gap-2">
              {Array.isArray(postComments) &&
                postComments.map((comment, index) => {
                  if (!isCommentDocument(comment)) return null
                  return (
                    <CommentComponent
                      key={comment._id?.toString() || `comment-${index}`}
                      comment={comment}
                    />
                  )
                })}
            </div>

            <form
              onSubmit={handleCommentSubmit}
              className="flex items-center gap-2 border-t border-solid border-[#E7ECF0] pt-4"
            >
              <Avatar
                gender={user?.gender}
                size="h-6 w-6"
                src={user?.profilePicture?.url || null}
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="h-[30px] w-full rounded-full bg-[#E7ECF0] px-3 text-xs outline-none"
                  placeholder="Write a comment..."
                />
              </div>
            </form>
          </div>
        </div>
        <Menu as="div" className="relative z-50">
          <MenuButton className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100">
            <HiOutlineEllipsisHorizontal className="h-5 w-5" />
          </MenuButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 mt-1 w-30 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="px-1">
                <MenuItem>
                  <Link
                    href={`/post/${post._id}`}
                    className="group flex w-full items-center rounded-md px-2 py-2 text-xs text-gray-900 data-[focus]:bg-sky-500 data-[focus]:text-white"
                  >
                    View Post
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button className="group flex w-full items-center rounded-md px-2 py-2 text-xs text-gray-900 data-[focus]:bg-sky-500 data-[focus]:text-white">
                    Save post
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleCopyLink}
                    className="group flex w-full items-center rounded-md px-2 py-2 text-xs text-gray-900 data-[focus]:bg-sky-500 data-[focus]:text-white"
                  >
                    Copy link
                  </button>
                </MenuItem>
              </div>
              {user?._id === post.author._id && (
                <div className="px-1">
                  <MenuItem>
                    <button className="group flex w-full items-center rounded-md px-2 py-2 text-xs text-red-500 data-[focus]:bg-red-500 data-[focus]:text-white">
                      Delete post
                    </button>
                  </MenuItem>
                </div>
              )}
            </MenuItems>
          </Transition>
        </Menu>
      </div>

      {/* ShareModal - dynamically imported */}
      {showShareModal && (
        <ShareModalAbly
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={post}
          onShareToFeed={() => {
            // Optionally refresh the feed or show success message
            toast.success('Post shared successfully!')
          }}
        />
      )}
    </div>
  )
}

export default Post
