import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { safeApiError } from '@/lib/apiError'
import { getAblyInstance } from '@/lib/ably'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Blog from '@/models/Blog'
import BlogComment, { IBlogCommentDocument } from '@/models/BlogComment'
import { MAX_BLOG_COMMENT_LENGTH } from '@/data/constants'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
import type { FilterQuery } from 'mongoose'
import { isValidObjectId, type Types } from 'mongoose'

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    const { slug } = await params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const content =
      body &&
      typeof body === 'object' &&
      body !== null &&
      'content' in body &&
      typeof (body as { content: unknown }).content === 'string'
        ? (body as { content: string }).content
        : undefined

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    if (content.length > MAX_BLOG_COMMENT_LENGTH) {
      return NextResponse.json(
        {
          error: `Comment must be ${MAX_BLOG_COMMENT_LENGTH} characters or less`
        },
        { status: 400 }
      )
    }

    // Find the blog
    const blog = await Blog.findOne({ slug, status: 'published' })
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Create the comment
    const comment = (await BlogComment.create({
      content: content.trim(),
      author: currentUser._id,
      blog: blog._id
    })) as IBlogCommentDocument

    // Populate the comment with author details
    await comment.populate({
      path: 'author',
      select: 'firstName lastName username gender pronoun profilePicture'
    })

    // Add comment to blog
    await Blog.findByIdAndUpdate(blog._id, {
      $push: { comments: comment._id }
    })

    // Convert to plain object and handle ObjectIds safely
    const commentObj = comment.toObject()

    // Real-time update via Ably
    try {
      const ably = getAblyInstance()
      const channel = ably.channels.get(`blog-${blog._id}`)
      await channel.publish('comment', {
        blogId: blog._id,
        comment: convertObjectIdsToStrings(commentObj),
        user: {
          _id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          username: currentUser.username
        }
      })
    } catch (error) {
      console.error('Error publishing comment event:', error)
      // Don't fail the request if real-time fails
    }

    return NextResponse.json(convertObjectIdsToStrings(commentObj))
  } catch (error: unknown) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: safeApiError(error, 'Internal server error') },
      { status: 500 }
    )
  }
}

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    await client()
    await initModels()

    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10)
    const limit = Math.min(
      Math.max(Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 20, 1),
      100
    )
    const cursor = searchParams.get('cursor')

    // Find the blog
    const blog = await Blog.findOne({ slug, status: 'published' })
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Build query for comments
    let query: FilterQuery<IBlogCommentDocument> = { blog: blog._id }
    if (cursor) {
      const cursorDate = new Date(cursor)
      if (Number.isNaN(cursorDate.getTime())) {
        return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 })
      }
      query.createdAt = { $gt: cursorDate }
    }

    // Get comments sorted oldest first (newest at bottom, like chat)
    const comments = await BlogComment.find(query)
      .sort({ createdAt: 1 })
      .limit(limit + 1)
      .populate({
        path: 'author',
        select: 'firstName lastName username gender pronoun profilePicture'
      })
      .lean()

    const hasMore = comments.length > limit
    const commentsToReturn = hasMore ? comments.slice(0, limit) : comments
    // For ascending sort, cursor should be the last item's createdAt
    const nextCursor =
      hasMore && commentsToReturn.length > 0
        ? commentsToReturn[commentsToReturn.length - 1].createdAt.toISOString()
        : null

    // Convert to plain objects and handle ObjectIds safely
    const convertedComments = convertObjectIdsToStrings(commentsToReturn)

    return NextResponse.json({
      comments: convertedComments,
      nextCursor,
      hasMore
    })
  } catch (error: unknown) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: safeApiError(error, 'Internal server error') },
      { status: 500 }
    )
  }
}

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    await params
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    if (!isValidObjectId(commentId)) {
      return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 })
    }

    // Find the comment
    const comment = await BlogComment.findById(commentId).lean<{
      _id: Types.ObjectId
      author: Types.ObjectId
      blog: Types.ObjectId
    } | null>()
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Check if user is the author of the comment
    if (comment.author.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own comments' },
        { status: 403 }
      )
    }

    // Delete the comment
    await BlogComment.findByIdAndDelete(commentId)

    // Remove comment reference from blog
    await Blog.findByIdAndUpdate(comment.blog, {
      $pull: { comments: commentId }
    })

    // Real-time update via Ably
    try {
      const ably = getAblyInstance()
      const channel = ably.channels.get(`blog-${comment.blog}`)
      await channel.publish('comment-delete', {
        blogId: comment.blog,
        commentId,
        userId: currentUser._id
      })
    } catch (error) {
      console.error('Error publishing comment delete event:', error)
      // Don't fail the request if real-time fails
    }

    return NextResponse.json({ message: 'Comment deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: safeApiError(error, 'Internal server error') },
      { status: 500 }
    )
  }
}
