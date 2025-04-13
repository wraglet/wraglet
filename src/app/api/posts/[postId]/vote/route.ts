import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import Post from '@/models/Post'
import PostVote from '@/models/PostVote'

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
    const { voteType } = body
    const postId = (await params).postId

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if the user has already voted on the post
    const existingVote = await PostVote.findOne({
      postId: postId,
      userId: currentUser._id
    })

    let vote
    if (existingVote) {
      // Update existing vote
      vote = await PostVote.findByIdAndUpdate(
        existingVote._id,
        { voteType, updatedAt: new Date() },
        { new: true }
      )

      // Update vote in post's votes array
      await Post.findByIdAndUpdate(
        postId,
        {
          $set: { 'votes.$[elem].voteType': voteType }
        },
        {
          arrayFilters: [{ 'elem._id': existingVote._id }]
        }
      )
    } else {
      // Create new vote
      vote = new PostVote({
        postId: postId,
        voteType,
        userId: currentUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      await vote.save()

      // Add vote to post if it's new
      await Post.findByIdAndUpdate(postId, {
        $push: { votes: vote }
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

    // Find and remove the vote
    const vote = await PostVote.findOneAndDelete({
      postId: postId,
      userId: currentUser._id
    })

    if (vote) {
      // Remove vote from post using the vote's _id
      await Post.findByIdAndUpdate(postId, {
        $pull: { votes: { _id: vote._id } }
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
    console.error('Error processing DELETE request:', err)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
