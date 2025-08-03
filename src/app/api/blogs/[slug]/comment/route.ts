import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { getAblyInstance } from '@/lib/ably'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Blog from '@/models/Blog'
import BlogComment, { IBlogCommentDocument } from '@/models/BlogComment'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    const { slug } = await params
    const { content } = await request.json()

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Find the blog
    const blog = (await Blog.findOne({ slug, status: 'published' })) as any
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
  } catch (error: any) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor')

    // Find the blog
    const blog = await Blog.findOne({ slug, status: 'published' })
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Build query for comments
    let query: any = { blog: blog._id }
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) }
    }

    // Get comments
    const comments = await BlogComment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate({
        path: 'author',
        select: 'firstName lastName username gender pronoun profilePicture'
      })
      .lean()

    const hasMore = comments.length > limit
    const commentsToReturn = hasMore ? comments.slice(0, limit) : comments
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
  } catch (error: any) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
