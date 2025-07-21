import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { getAblyInstance } from '@/lib/ably'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Blog from '@/models/Blog'
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

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Find the blog
    const blog = (await Blog.findOne({ slug, status: 'published' })) as any
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    const userId = currentUser._id.toString()
    const isLiked = blog.likedBy.includes(userId)

    let updatedBlog
    if (isLiked) {
      // Unlike the blog
      updatedBlog = (await Blog.findByIdAndUpdate(
        blog._id,
        {
          $pull: { likedBy: userId },
          $inc: { likes: -1 }
        },
        { new: true }
      )
        .populate({
          path: 'author',
          select: 'firstName lastName username gender pronoun profilePicture'
        })
        .lean()) as any
    } else {
      // Like the blog
      updatedBlog = (await Blog.findByIdAndUpdate(
        blog._id,
        {
          $addToSet: { likedBy: userId },
          $inc: { likes: 1 }
        },
        { new: true }
      )
        .populate({
          path: 'author',
          select: 'firstName lastName username gender pronoun profilePicture'
        })
        .lean()) as any
    }

    if (!updatedBlog) {
      return NextResponse.json(
        { error: 'Failed to update blog' },
        { status: 500 }
      )
    }

    // Real-time update via Ably
    try {
      const ably = getAblyInstance()
      const channel = ably.channels.get(`blog-${blog._id}`)
      await channel.publish('like', {
        blogId: blog._id,
        userId,
        isLiked: !isLiked,
        likes: updatedBlog.likes,
        user: {
          _id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          username: currentUser.username
        }
      })
    } catch (error) {
      console.error('Error publishing like event:', error)
      // Don't fail the request if real-time fails
    }

    return NextResponse.json({
      liked: !isLiked,
      likes: updatedBlog.likes,
      blog: convertObjectIdsToStrings(updatedBlog)
    })
  } catch (error: any) {
    console.error('Error liking blog:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
