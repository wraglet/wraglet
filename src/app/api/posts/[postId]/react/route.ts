import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import Post from '@/models/Post'
import PostReaction from '@/models/PostReaction'
import mongoose from 'mongoose'

export const PATCH = async (
  request: Request,
  {
    params
  }: {
    params: Promise<{ postId: string }>
  }
) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)

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

    if (existingReaction) {
      console.error('User has already reacted to this post')
      return new NextResponse('User has already reacted to this post', {
        status: 400
      })
    }

    const reaction = new PostReaction({
      postId: postId,
      type,
      userId: currentUser._id,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await reaction.save()

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { reactions: reaction._id } },
      { new: true }
    )

    if (!updatedPost) {
      return new NextResponse('Post not found', { status: 404 })
    }

    console.log(`Reaction '${type}' added successfully`)

    return new NextResponse('Reaction added successfully', { status: 200 })
  } catch (err: any) {
    console.log('Error while processing PATCH request: ', err)
    console.error(
      'Error happened while doing PATCH for /api/posts/[postId]/react at route.ts: ',
      err
    )
    return new NextResponse('Internal Error: ', { status: 500 })
  }
}
