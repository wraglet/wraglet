import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import Post from '@/models/Post'
import PostReaction from '@/models/PostReaction'

export const PATCH = async (
  request: Request,
  {
    params
  }: {
    params: Promise<{ postId: string }>
  }
) => {
  try {
    await client()

    const currentUser = await getCurrentUser()
    const body = await request.json()
    const { type } = body
    const postId = (await params).postId

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if the user has already reacted to the post
    const existingReaction = await PostReaction.findOne({
      postId: postId,
      userId: currentUser._id
    })

    let reaction
    if (existingReaction) {
      // Update existing reaction
      reaction = await PostReaction.findByIdAndUpdate(
        existingReaction._id,
        { type, updatedAt: new Date() },
        { new: true }
      )
    } else {
      // Create new reaction
      reaction = new PostReaction({
        postId: postId,
        type,
        userId: currentUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      await reaction.save()

      // Add reaction to post if it's new
      await Post.findByIdAndUpdate(postId, {
        $push: { reactions: reaction._id }
      })
    }

    const updatedPost = await Post.findById(postId)
      .populate({
        path: 'author',
        select: 'firstName lastName username gender pronoun profilePicture'
      })
      .populate({
        path: 'reactions',
        populate: {
          path: 'userId',
          select: 'firstName lastName username profilePicture'
        }
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'firstName lastName username gender pronoun profilePicture'
        }
      })

    if (!updatedPost) {
      return new NextResponse('Post not found', { status: 404 })
    }

    return NextResponse.json(updatedPost)
  } catch (err: any) {
    console.error('Error processing PATCH request:', err)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const DELETE = async (
  request: Request,
  {
    params
  }: {
    params: Promise<{ postId: string }>
  }
) => {
  try {
    await client()

    const currentUser = await getCurrentUser()
    const postId = (await params).postId

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Find and delete the reaction
    const deletedReaction = await PostReaction.findOneAndDelete({
      postId: postId,
      userId: currentUser._id
    })

    if (!deletedReaction) {
      return new NextResponse('Reaction not found', { status: 404 })
    }

    // Remove reaction from post
    await Post.findByIdAndUpdate(postId, {
      $pull: { reactions: deletedReaction._id }
    })

    // Get updated post
    const updatedPost = await Post.findById(postId)
      .populate({
        path: 'author',
        select: 'firstName lastName username gender pronoun profilePicture'
      })
      .populate({
        path: 'reactions',
        populate: {
          path: 'userId',
          select: 'firstName lastName username profilePicture'
        }
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'firstName lastName username gender pronoun profilePicture'
        }
      })

    if (!updatedPost) {
      return new NextResponse('Post not found', { status: 404 })
    }

    return NextResponse.json(updatedPost)
  } catch (err: any) {
    console.error('Error processing DELETE request:', err)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
