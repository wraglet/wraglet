'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { PublicUser } from '@/interfaces'
import { profileHrefFromUsername } from '@/lib/profileHref'
import { IBlog } from '@/models/Blog'
import { IBlogComment } from '@/models/BlogComment'
import { ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useChannel } from 'ably/react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

import { DEFAULT_GENDER } from '@/data/constants'
import BlogReactionControls from '@/components/blog/BlogReactionControls'
import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

// Dynamic import for BlogShareModal
const BlogShareModal = dynamic(
  () => import('@/components/blog/BlogShareModal'),
  {
    ssr: false
  }
)

interface BlogInteractionsProps {
  blog: IBlog
  currentUser: PublicUser | null
}

interface CommentItemProps {
  comment: IBlogComment
  currentUserId?: string
  onDelete: (commentId: string) => void
}

const CommentItem = ({
  comment,
  currentUserId,
  onDelete
}: CommentItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const isOwner = currentUserId === comment.author._id
  const authorProfileHref = profileHrefFromUsername(comment.author.username)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    setIsDeleting(true)
    try {
      await onDelete(comment._id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex gap-2 py-1.5">
      {authorProfileHref ? (
        <Link
          href={authorProfileHref}
          className="shrink-0 rounded-full ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/40"
        >
          <Avatar
            gender={comment.author.gender || DEFAULT_GENDER}
            src={comment.author.profilePicture?.url || null}
            size="h-8 w-8"
          />
        </Link>
      ) : (
        <Avatar
          gender={comment.author.gender || DEFAULT_GENDER}
          src={comment.author.profilePicture?.url || null}
          size="h-8 w-8"
        />
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {authorProfileHref ? (
              <Link
                href={authorProfileHref}
                className="text-xs font-bold text-gray-900 hover:text-[#0EA5E9]"
              >
                {comment.author.firstName} {comment.author.lastName}
              </Link>
            ) : (
              <span className="text-xs font-bold text-gray-900">
                {comment.author.firstName} {comment.author.lastName}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt || Date.now()), {
                addSuffix: true
              })}
            </span>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-red-600 hover:text-red-800 disabled:text-gray-400"
              title="Delete comment"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-700">{comment.content}</p>
      </div>
    </div>
  )
}

const BlogInteractions = ({
  blog: initialBlog,
  currentUser
}: BlogInteractionsProps) => {
  const [blog, setBlog] = useState(initialBlog)
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const queryClient = useQueryClient()
  const commentsEndRef = useRef<HTMLDivElement>(null)

  // Helper function to add comment without duplicates (append to bottom for chat-style)
  const addCommentToCache = (newComment: IBlogComment) => {
    if (!newComment._id) {
      console.warn('Comment missing _id field:', newComment)
      return
    }

    queryClient.setQueryData(
      ['blog-comments', blog.slug],
      (old: IBlogComment[] = []) => {
        // Check if this comment already exists to prevent duplicates
        const commentExists = old.some(
          (comment) => comment._id === newComment._id
        )
        if (commentExists) {
          return old
        }
        // Append to end (bottom) for chat-style ordering
        return [...old, newComment]
      }
    )
    // Scroll to bottom when new comment is added
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Fetch comments with TanStack Query
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['blog-comments', blog.slug],
    queryFn: async () => {
      const response = await axios.get(`/api/blogs/${blog.slug}/comment`)
      return response.data.comments
    },
    enabled: true // Always fetch to get accurate comment count
  })

  // Auto-scroll to bottom when comments are loaded or section is opened
  useEffect(() => {
    if (showComments && comments.length > 0) {
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [showComments, comments.length])

  // Calculate comment count - use comments from query
  const commentCount = comments.length

  // Post comment mutation
  const postCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await axios.post(`/api/blogs/${blog.slug}/comment`, {
        content
      })
      return response.data
    },
    onSuccess: (newComment) => {
      setNewComment('')
      // Update the comments cache, but check for duplicates first
      addCommentToCache(newComment)
      if (!showComments) {
        setShowComments(true)
      }
      toast.success('Comment posted!')
    },
    onError: (error) => {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    }
  })

  // Real-time channel for blog interactions
  useChannel(`blog-${blog._id}`, (message) => {
    if (message.name === 'reaction' && message.data?.blog) {
      setBlog(message.data.blog as IBlog)
    } else if (message.name === 'comment') {
      // Only add comment if it's not from the current user (to avoid duplicates)
      // The current user's comment is already added via onSuccess callback
      if (message.data.comment.author._id !== currentUser?._id) {
        addCommentToCache(message.data.comment)
      }
    } else if (message.name === 'comment-delete') {
      // Remove deleted comment from cache
      queryClient.setQueryData(
        ['blog-comments', blog.slug],
        (old: IBlogComment[] = []) => {
          return old.filter((comment) => comment._id !== message.data.commentId)
        }
      )
    }
  })

  // Delete comment handler
  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(
        `/api/blogs/${blog.slug}/comment?commentId=${commentId}`
      )
      // Optimistically remove from cache
      queryClient.setQueryData(
        ['blog-comments', blog.slug],
        (old: IBlogComment[] = []) => {
          return old.filter((comment) => comment._id !== commentId)
        }
      )
      toast.success('Comment deleted successfully')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
      // Refetch to restore the comment if delete failed
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blog.slug] })
    }
  }

  const handleComment = async (e: FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      toast.error('Please login to comment')
      return
    }

    if (!newComment.trim() || postCommentMutation.isPending) return

    postCommentMutation.mutate(newComment.trim())
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  return (
    <div className="mt-3 border-t border-[#E7ECF0] pt-2">
      {/* Interaction Buttons */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <BlogReactionControls
            blog={blog}
            currentUser={currentUser}
            onBlogUpdated={setBlog}
          />

          {/* Comment Button */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
            <span className="font-medium">{commentCount}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ShareIcon className="h-3.5 w-3.5" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-2">
          {/* Add Comment Form */}
          {currentUser ? (
            <form onSubmit={handleComment} className="flex gap-2">
              <Avatar
                gender={currentUser.gender}
                src={currentUser.profilePicture?.url || null}
                size="h-8 w-8"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full resize-none rounded-2xl border-0 bg-[#E7ECF0] px-3 py-2 text-xs text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#0EA5E9]/25 focus:outline-none"
                  rows={2}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      !newComment.trim() || postCommentMutation.isPending
                    }
                    className="h-8 rounded-full bg-sky-500 px-4 text-xs font-medium text-white hover:bg-sky-600 disabled:opacity-50"
                  >
                    {postCommentMutation.isPending
                      ? 'Posting...'
                      : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="rounded-md bg-[#E7ECF0]/80 px-3 py-2 text-center">
              <p className="text-xs text-gray-600">
                Please login to comment on this blog.
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-1">
            {isLoadingComments ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex animate-pulse space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="mb-2 h-3 w-1/4 rounded bg-gray-200"></div>
                      <div className="h-3 w-3/4 rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {comments.map((comment: IBlogComment, index: number) => (
                  <CommentItem
                    key={comment._id || `comment-${index}`}
                    comment={comment}
                    currentUserId={currentUser?._id}
                    onDelete={handleDeleteComment}
                  />
                ))}
                {/* Scroll anchor for auto-scroll to bottom */}
                <div ref={commentsEndRef} />
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-gray-500">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blog Share Modal */}
      {showShareModal && (
        <BlogShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          blog={blog}
        />
      )}
    </div>
  )
}

export default BlogInteractions
