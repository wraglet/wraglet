'use client'

import { FormEvent, useState } from 'react'
import { IBlog } from '@/models/Blog'
import { IComment } from '@/models/Comment'
import {
  ChatBubbleLeftIcon,
  HeartIcon as HeartOutline,
  ShareIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useChannel } from 'ably/react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

interface BlogInteractionsProps {
  blog: IBlog
  currentUser: any
}

interface CommentItemProps {
  comment: IComment
}

const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className="flex space-x-3 py-3">
      <Avatar
        gender={comment.author.gender}
        src={comment.author.profilePicture?.url || null}
        size="h-8 w-8"
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-900">
            {comment.author.firstName} {comment.author.lastName}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt || Date.now()), {
              addSuffix: true
            })}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
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
  const [isLiking, setIsLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const queryClient = useQueryClient()

  // Check if user has liked the blog
  const isLiked = currentUser && blog.likedBy?.includes(currentUser._id)

  // Fetch comments with TanStack Query
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['blog-comments', blog.slug],
    queryFn: async () => {
      const response = await axios.get(`/api/blogs/${blog.slug}/comment`)
      return response.data.comments
    },
    enabled: showComments // Only fetch when comments are shown
  })

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
      // Update the comments cache
      queryClient.setQueryData(
        ['blog-comments', blog.slug],
        (old: IComment[] = []) => [newComment, ...old]
      )
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
  const channel = useChannel(`blog-${blog._id}`, (message) => {
    if (message.name === 'like') {
      setBlog((prev) => ({
        ...prev,
        likes: message.data.likes,
        likedBy: message.data.isLiked
          ? [...(prev.likedBy || []), message.data.userId]
          : (prev.likedBy || []).filter(
              (id: string) => id !== message.data.userId
            )
      }))
    } else if (message.name === 'comment') {
      // Update comments cache with real-time data
      queryClient.setQueryData(
        ['blog-comments', blog.slug],
        (old: IComment[] = []) => [message.data.comment, ...old]
      )
    }
  })

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please login to like this blog')
      return
    }

    if (isLiking) return

    setIsLiking(true)
    try {
      const response = await axios.post(`/api/blogs/${blog.slug}/like`)

      // Optimistic update - the real-time channel will also update this
      setBlog((prev) => ({
        ...prev,
        likes: response.data.likes,
        likedBy: response.data.liked
          ? [...(prev.likedBy || []), currentUser._id]
          : (prev.likedBy || []).filter((id: string) => id !== currentUser._id)
      }))
    } catch (error) {
      console.error('Error liking blog:', error)
      toast.error('Failed to like blog')
    } finally {
      setIsLiking(false)
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/blog/${blog.slug}`
      )
      toast.success('Blog link copied to clipboard!')
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const url = `${window.location.origin}/blog/${blog.slug}`
      prompt('Copy this link:', url)
    }
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      {/* Interaction Buttons */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLiking || !currentUser}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
              isLiked
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${!currentUser ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {isLiked ? (
              <HeartSolid className="h-4 w-4" />
            ) : (
              <HeartOutline className="h-4 w-4" />
            )}
            <span className="font-medium">{blog.likes || 0}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
          >
            <ChatBubbleLeftIcon className="h-4 w-4" />
            <span className="font-medium">{comments.length}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
          >
            <ShareIcon className="h-4 w-4" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4">
          {/* Add Comment Form */}
          {currentUser ? (
            <form onSubmit={handleComment} className="flex space-x-3">
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
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      !newComment.trim() || postCommentMutation.isPending
                    }
                    className="h-8 px-3 text-xs"
                  >
                    {postCommentMutation.isPending
                      ? 'Posting...'
                      : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600">
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
                {comments.map((comment: IComment) => (
                  <CommentItem key={comment._id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-500">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BlogInteractions
