'use client'

import {
  startTransition,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState
} from 'react'
import type { SubmitEvent } from 'react'
import dynamic from 'next/dynamic'
import { usePostAuthorCard } from '@/lib/hooks/usePostAuthorCard'
import { IComment } from '@/models/Comment'
import { IPost } from '@/models/Post'
import useUserStore from '@/store/user'
import {
  mergePostClientUpdate,
  mergePostFromFeedProp
} from '@/utils/mergePostClientUpdate'
import { useChannel } from 'ably/react'
import axios from 'axios'
import toast from 'react-hot-toast'

import { buildPostReactionGroups } from '@/components/feed/post/buildPostReactionGroups'
import PostAuthorHeader from '@/components/feed/PostAuthorHeader'
import PostCommentsPanel from '@/components/feed/PostCommentsPanel'
import PostFooterActionsRow from '@/components/feed/PostFooterActionsRow'
import PostInteractionCountsRow from '@/components/feed/PostInteractionCountsRow'
import PostOverflowMenu from '@/components/feed/PostOverflowMenu'

const ShareModalWithAbly = dynamic(
  () => import('@/components/feed/ShareModalWithAbly'),
  {
    ssr: false
  }
)

interface PostProps {
  post: IPost
}

const Post = ({ post: initialPost }: PostProps) => {
  useEffect(() => {
    import('@lottiefiles/lottie-player')
  }, [])

  const { user } = useUserStore()
  const [post, setPost] = useState<IPost>(initialPost)
  const [optimisticPost, addOptimistic] = useOptimistic(
    post,
    (state, patch: Partial<IPost> | IPost) =>
      mergePostClientUpdate(state, patch as IPost)
  )
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [comment, setComment] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [postComments, setPostComments] = useState<IComment[]>(
    (initialPost.comments || []).filter(
      (c): c is IComment => typeof c !== 'string' && '_id' in c
    )
  )

  const initialPostIdRef = useRef(String(initialPost._id))
  const postRef = useRef(post)
  postRef.current = post
  const content = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const id = String(initialPost._id)
    if (initialPostIdRef.current !== id) {
      initialPostIdRef.current = id
      setPost(initialPost)
      setPostComments(
        (initialPost.comments || []).filter(
          (c): c is IComment => typeof c !== 'string' && '_id' in c
        )
      )
      return
    }
    setPost((prev) => mergePostFromFeedProp(prev, initialPost))
  }, [initialPost])

  const channel = useChannel(`post-${optimisticPost._id}`, (message) => {
    if (message.clientId === user?._id) {
      return
    }

    if (message.name === 'comment') {
      const newComment = message.data
      setPostComments((prevComments) => {
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

  const handleReaction = async (type: string) => {
    if (!user) return

    const existingReaction = optimisticPost.reactions.find(
      (reaction) => reaction.userId?._id === user._id && reaction.type === type
    )

    if (existingReaction) {
      await removeReaction()
      return
    }

    const previousPost = postRef.current

    startTransition(() => {
      const currentPost = postRef.current
      const patch = {
        reactions: [
          ...currentPost.reactions.filter(
            (reaction) => reaction.userId?._id !== user._id
          ),
          {
            type,
            userId: user,
            _id: `optimistic-${Date.now()}`
          } as (typeof currentPost.reactions)[number]
        ]
      }
      addOptimistic(patch)
      setPost((prev) => mergePostClientUpdate(prev, patch as IPost))
    })

    try {
      const response = await axios.patch(
        `/api/posts/${optimisticPost._id}/react`,
        { type }
      )

      if (response.status !== 200) {
        throw new Error('Failed to update reaction')
      }

      const updatedPost = response.data as IPost
      setPost((prev) => mergePostClientUpdate(prev, updatedPost))

      if (channel?.publish) {
        await channel.publish({
          name: 'reaction',
          data: updatedPost
        })
      }
    } catch (error) {
      console.error('Error updating reaction:', error)
      setPost(previousPost)
      toast.error('Failed to update reaction')
    }
  }

  const removeReaction = async () => {
    if (!user) return

    const previousPost = postRef.current

    startTransition(() => {
      const currentPost = postRef.current
      const patch = {
        reactions: currentPost.reactions.filter(
          (reaction) => reaction.userId?._id !== user._id
        )
      }
      addOptimistic(patch)
      setPost((prev) => mergePostClientUpdate(prev, patch as IPost))
    })

    try {
      const response = await axios.delete(
        `/api/posts/${optimisticPost._id}/react`
      )

      if (response.status !== 200) {
        throw new Error('Failed to remove reaction')
      }

      const updatedPost = response.data as IPost
      setPost((prev) => mergePostClientUpdate(prev, updatedPost))

      if (channel?.publish) {
        await channel.publish({
          name: 'reaction',
          data: updatedPost
        })
      }
    } catch (error) {
      console.error('Error removing reaction:', error)
      setPost(previousPost)
      toast.error('Failed to remove reaction')
    }
  }

  const { reactionCounts, reactionGroups } = useMemo(
    () => buildPostReactionGroups(optimisticPost.reactions, user?._id),
    [optimisticPost.reactions, user?._id]
  )

  const userReaction = useMemo(() => {
    if (!user) return undefined
    return optimisticPost.reactions?.find(
      (reaction) => reaction.userId?._id === user._id
    )
  }, [user, optimisticPost.reactions])

  const handleCommentSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      const response = await axios.post(
        `/api/posts/${optimisticPost._id}/comment`,
        {
          content: comment
        }
      )

      const newComment = response.data

      setComment('')
      setShowCommentInput(true)

      if (channel?.publish) {
        await channel.publish('comment', newComment)
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    }
  }

  const isCommentDocument = (c: IComment | string): c is IComment => {
    return (
      typeof c === 'object' &&
      c !== null &&
      '_id' in c &&
      'content' in c &&
      'author' in c
    )
  }

  const userVote = optimisticPost.votes?.find(
    (vote) => vote.userId === user?._id
  )?.voteType

  const upvotes =
    optimisticPost.votes?.filter((vote) => vote.voteType === 'upvote').length ||
    0
  const downvotes =
    optimisticPost.votes?.filter((vote) => vote.voteType === 'downvote')
      .length || 0

  const {
    authorId,
    authorProfileHref,
    authorDisplayName,
    isAuthor,
    isFollowing,
    follow,
    loading,
    currentUserProfileHref
  } = usePostAuthorCard(optimisticPost, user)

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) return

    const previousPost = postRef.current

    startTransition(() => {
      const currentPost = postRef.current
      const currentVote = currentPost.votes?.find(
        (vote) => vote.userId === user._id
      )
      const optimisticVotes = (currentPost.votes ?? []).filter(
        (vote) => vote.userId !== user._id
      )

      if (currentVote?.voteType !== voteType) {
        optimisticVotes.push({
          userId: user._id,
          voteType,
          createdAt: new Date()
        })
      }

      const patch = { votes: optimisticVotes }
      addOptimistic(patch)
      setPost((prev) => mergePostClientUpdate(prev, patch as IPost))
    })

    try {
      const response = await fetch(`/api/posts/${optimisticPost._id}/vote`, {
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

      try {
        await channel.publish('vote', updatedPost)
      } catch (err) {
        console.warn('Failed to publish vote to Ably:', err)
      }
    } catch (error) {
      console.error('Error voting:', error)
      setPost(previousPost)
      toast.error('Failed to vote')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleCopyLink = async () => {
    const postUrl = `${globalThis.location.origin}/post/${optimisticPost._id}`
    await copyToClipboard(postUrl)
  }

  const toggleComment = () => {
    setShowCommentInput((prev) => !prev)
  }

  return (
    <div className="flex w-full">
      <div className="flex w-full flex-col border border-solid border-neutral-200 bg-white drop-shadow-md sm:rounded-lg">
        <div className="flex items-start gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <PostAuthorHeader
            post={optimisticPost}
            authorProfileHref={authorProfileHref}
            authorDisplayName={authorDisplayName}
            isAuthor={isAuthor}
            authorId={authorId}
            isFollowing={isFollowing}
            follow={follow}
            loading={loading}
          />
          <PostOverflowMenu
            postId={String(optimisticPost._id)}
            isAuthor={isAuthor}
            onCopyLink={handleCopyLink}
          />
        </div>

        <PostInteractionCountsRow
          reactionGroups={reactionGroups}
          reactionCounts={reactionCounts}
          commentCount={postComments.length}
          upvotes={upvotes}
          downvotes={downvotes}
          shareCount={optimisticPost.shareCount}
          postId={String(optimisticPost._id)}
        />

        <PostFooterActionsRow
          postId={String(optimisticPost._id)}
          userReaction={userReaction}
          onReact={handleReaction}
          onRemoveReaction={removeReaction}
          userVote={userVote}
          onVote={handleVote}
          onToggleComment={toggleComment}
          onShare={() => setShowShareModal(true)}
        />

        <PostCommentsPanel
          showCommentInput={showCommentInput}
          contentRef={content}
          postComments={postComments}
          user={user}
          currentUserProfileHref={currentUserProfileHref}
          comment={comment}
          onCommentChange={setComment}
          onCommentSubmit={handleCommentSubmit}
          isCommentDocument={isCommentDocument}
        />
      </div>

      {showShareModal && (
        <ShareModalWithAbly
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={optimisticPost}
        />
      )}
    </div>
  )
}

export default Post
