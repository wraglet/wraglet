'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
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
import { useChannel } from 'ably/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaRegComment, FaRegHeart } from 'react-icons/fa6'
import { LuArrowBigDown, LuArrowBigUp } from 'react-icons/lu'

import Avatar from '@/components/Avatar'
import CommentComponent from '@/components/Comment'
import ReactionIcon from '@/components/ReactionIcon'

interface PostInteractionsProps {
  post: IPost
}

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

const PostInteractions = ({ post: initialPost }: PostInteractionsProps) => {
  useEffect(() => {
    import('@lottiefiles/lottie-player')
  }, [])

  const { user } = useUserStore()
  const [post, setPost] = useState<IPost>(initialPost)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [comment, setComment] = useState('')
  const [postComments, setPostComments] = useState(
    (initialPost.comments || []).filter(
      (comment): comment is any =>
        typeof comment !== 'string' && '_id' in comment
    )
  )

  // Try to use Ably channel for both comments and reactions
  const channel = useChannel(`post-${post._id}`, (message) => {
    // Ignore messages from the current user to prevent duplication
    if (message.clientId === user?._id) {
      return
    }

    if (message.name === 'comment') {
      const newComment = message.data
      setPostComments((prevComments) => {
        // Double-check to prevent duplicates under any circumstance
        if (prevComments.some((c) => c._id === newComment._id)) {
          return prevComments
        }
        return [...prevComments, newComment]
      })
      setShowCommentInput(true)
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
  const content = useRef<HTMLDivElement | null>(null)
  const [reactionGroups, setReactionGroups] = useState<ReactionGroup[]>([])

  useEffect(() => {
    if (showCommentInput && content.current) {
      setHeight(`${content.current.scrollHeight}px`)
    } else {
      setHeight('0px')
    }
  }, [showCommentInput, post.comments])

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
        // Determine if this is a share or a regular post
        const isShare = 'originalPost' in post
        const apiEndpoint = isShare
          ? `/api/shares/${post._id}/react`
          : `/api/posts/${post._id}/react`

        // Either add new reaction or update existing one
        const response = await axios.patch(apiEndpoint, {
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
      // Determine if this is a share or a regular post
      const isShare = 'originalPost' in post
      const apiEndpoint = isShare
        ? `/api/shares/${post._id}/react`
        : `/api/posts/${post._id}/react`

      const response = await axios.delete(apiEndpoint)

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

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      // Determine if this is a share or a regular post
      const isShare = 'originalPost' in post
      const apiEndpoint = isShare
        ? `/api/shares/${post._id}/vote`
        : `/api/posts/${post._id}/vote`

      const response = await fetch(apiEndpoint, {
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

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      // Determine if this is a share or a regular post
      const isShare = 'originalPost' in post
      const apiEndpoint = isShare
        ? `/api/shares/${post._id}/comment`
        : `/api/posts/${post._id}/comment`

      const response = await axios.post(apiEndpoint, {
        content: comment
      })

      const newComment = response.data

      // Clear the input field and keep comments open
      setComment('')
      setShowCommentInput(true)

      // Publish to Ably channel. The useChannel hook will handle adding it to the state.
      if (channel && channel.publish) {
        await channel.publish('comment', newComment)
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    }
  }

  const isCommentDocument = (comment: any): comment is any => {
    return (
      typeof comment === 'object' &&
      comment !== null &&
      '_id' in comment &&
      'content' in comment &&
      'author' in comment
    )
  }

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

  return (
    <div>
      {/* Interaction counts section */}
      <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
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
            <span>
              {postComments.length}{' '}
              {postComments.length === 1 ? 'comment' : 'comments'}
            </span>
          )}
          {voteDisplay}
          {post.shareCount !== undefined && post.shareCount > 0 && (
            <span>
              {post.shareCount} {post.shareCount === 1 ? 'share' : 'shares'}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-solid border-[#E7ECF0] px-4 py-3">
        <div className="flex items-center justify-between">
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

          <div className="flex items-center gap-2">
            {/* Voting buttons */}
            <button
              onClick={() => handleVote('upvote')}
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 transition-colors ${
                userVote === 'upvote'
                  ? 'border-green-500 bg-green-50 text-green-600'
                  : 'border-gray-400 text-gray-600 hover:border-green-500 hover:bg-green-50'
              }`}
            >
              <LuArrowBigUp className="text-xs" />
            </button>

            <button
              onClick={() => handleVote('downvote')}
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 transition-colors ${
                userVote === 'downvote'
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-400 text-gray-600 hover:border-red-500 hover:bg-red-50'
              }`}
            >
              <LuArrowBigDown className="text-xs" />
            </button>

            {/* Comment button */}
            <div
              className="flex cursor-pointer items-center gap-1 rounded-full border border-solid border-gray-400 px-2 py-0.5 transition-colors hover:bg-gray-50"
              onClick={toggleComment}
            >
              <FaRegComment className="text-xs text-gray-600" />
            </div>

            {/* Share button is intentionally removed for shared posts */}
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div
        style={{ maxHeight: showCommentInput ? 'none' : '0px' }}
        ref={content}
        className={`${
          showCommentInput
            ? 'border-t border-solid border-[#E7ECF0] pt-4'
            : 'hidden'
        } flex w-full flex-col gap-4 overflow-hidden px-4 pb-4 transition-all duration-300 ease-in-out`}
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
  )
}

export default PostInteractions
