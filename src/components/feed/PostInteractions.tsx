'use client'

import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { profileHrefFromUsername } from '@/lib/profileHref'
import { IPost } from '@/models/Post'
import useUserStore from '@/store/user'
import {
  mergePostClientUpdate,
  mergePostFromFeedProp
} from '@/utils/mergePostClientUpdate'
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

import CommentComponent from '@/components/feed/Comment'
import Button from '@/components/shared/Button'
import CurrentUserAvatar from '@/components/shared/CurrentUserAvatar'
import Input from '@/components/shared/Input'
import ReactionIcon from '@/components/shared/ReactionIcon'

const ACTION_PILL_BASE =
  'flex items-center gap-1 rounded-full border px-2 py-0.5 transition-colors'
const ACTION_PILL_NEUTRAL = `${ACTION_PILL_BASE} border-gray-400 text-gray-600 hover:bg-gray-50`
const ACTION_PILL_UPVOTE = `${ACTION_PILL_BASE} border-gray-400 text-gray-600 hover:border-green-500 hover:bg-green-50`
const ACTION_PILL_UPVOTE_ACTIVE = `${ACTION_PILL_BASE} border-green-500 bg-green-50 text-green-600`
const ACTION_PILL_DOWNVOTE = `${ACTION_PILL_BASE} border-gray-400 text-gray-600 hover:border-red-500 hover:bg-red-50`
const ACTION_PILL_DOWNVOTE_ACTIVE = `${ACTION_PILL_BASE} border-red-500 bg-red-50 text-red-600`
const COMMENT_INPUT_CLASS =
  'h-[30px] w-full rounded-full border-none bg-[#E7ECF0] px-3 text-xs shadow-none'

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

type PostCommentDoc = Exclude<
  NonNullable<IPost['comments']>[number],
  string | undefined
>

const isPopulatedComment = (
  comment: NonNullable<IPost['comments']>[number]
): comment is PostCommentDoc => typeof comment !== 'string' && '_id' in comment

const PostInteractions = ({ post: initialPost }: PostInteractionsProps) => {
  useEffect(() => {
    import('@lottiefiles/lottie-player')
  }, [])

  const { user } = useUserStore()
  const [post, setPost] = useState<IPost>(initialPost)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [comment, setComment] = useState('')
  const [postComments, setPostComments] = useState<PostCommentDoc[]>(
    (initialPost.comments || []).filter(isPopulatedComment)
  )

  const initialPostIdRef = useRef(String(initialPost._id))

  useEffect(() => {
    const id = String(initialPost._id)
    if (initialPostIdRef.current !== id) {
      initialPostIdRef.current = id
      setPost(initialPost)
      setPostComments((initialPost.comments || []).filter(isPopulatedComment))
      return
    }
    setPost((prev) => mergePostFromFeedProp(prev, initialPost))
  }, [initialPost])

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
      setPost((prev) => mergePostClientUpdate(prev, message.data as IPost))
    } else if (message.name === 'vote') {
      setPost((prev) => mergePostClientUpdate(prev, message.data as IPost))
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
      if (reaction.userId?._id === user?._id) {
        const userData = reaction.userId as User
        groups[reaction.type].users.push(userData)
      }
    })

    setReactionGroups(Object.values(groups))
  }, [post.reactions, user])

  const toggleComment = () => {
    setShowCommentInput((prev) => !prev)
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
          reaction.userId?._id === user._id && reaction.type === type
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

        const updatedPost = response.data as IPost
        setPost((prev) => mergePostClientUpdate(prev, updatedPost))

        await channel?.publish?.({
          name: 'reaction',
          data: updatedPost
        })
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

      const updatedPost = response.data as IPost
      setPost((prev) => mergePostClientUpdate(prev, updatedPost))

      await channel?.publish?.({
        name: 'reaction',
        data: updatedPost
      })
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

      const updatedPost = (await response.json()) as IPost
      setPost((prev) => mergePostClientUpdate(prev, updatedPost))

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

  const handleCommentSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
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
      await channel?.publish?.('comment', newComment)
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    }
  }

  const isCommentDocument = (comment: unknown): comment is PostCommentDoc =>
    typeof comment === 'object' &&
    comment !== null &&
    '_id' in comment &&
    'content' in comment &&
    'author' in comment

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
  const userReaction = post.reactions?.find(
    (reaction) => reaction.userId?._id === user?._id
  )

  const currentUserProfileHref = user?.username
    ? profileHrefFromUsername(user.username)
    : null

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
            <div className="flex items-center gap-1">
              {userReaction ? (
                <button
                  type="button"
                  className="flex items-center rounded-full border border-solid border-gray-400 px-2 py-0.5"
                  aria-label={`Remove ${userReaction.type} reaction`}
                  onClick={() => {
                    removeReaction().catch(() => {})
                  }}
                >
                  <ReactionIcon type={userReaction.type} />
                </button>
              ) : null}
              <button
                type="button"
                ref={refs.setReference}
                className="flex items-center rounded-full border border-solid border-gray-400 px-2 py-0.5"
                aria-label={userReaction ? 'Change reaction' : 'Add reaction'}
                onClick={handleReactionClick}
              >
                <FaRegHeart className="text-xs text-gray-600" />
              </button>
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
                  <Button
                    type="button"
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
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Voting buttons */}
            <Button
              type="button"
              onClick={() => handleVote('upvote')}
              className={`${
                userVote === 'upvote'
                  ? ACTION_PILL_UPVOTE_ACTIVE
                  : ACTION_PILL_UPVOTE
              }`}
            >
              <LuArrowBigUp className="text-xs" />
            </Button>

            <Button
              type="button"
              onClick={() => handleVote('downvote')}
              className={`${
                userVote === 'downvote'
                  ? ACTION_PILL_DOWNVOTE_ACTIVE
                  : ACTION_PILL_DOWNVOTE
              }`}
            >
              <LuArrowBigDown className="text-xs" />
            </Button>

            {/* Comment button */}
            <Button
              type="button"
              className={ACTION_PILL_NEUTRAL}
              onClick={toggleComment}
            >
              <FaRegComment className="text-xs text-gray-600" />
            </Button>

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
          <CurrentUserAvatar
            user={user}
            profileHref={currentUserProfileHref}
            size="h-6 w-6"
            linkClassName="shrink-0 rounded-full ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/40"
          />
          <div className="flex-1">
            <Input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={COMMENT_INPUT_CLASS}
              placeholder="Write a comment..."
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostInteractions
