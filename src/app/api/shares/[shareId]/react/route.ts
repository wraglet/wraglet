import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import { createReactionNotification } from '@/lib/notifications'
import PostReaction from '@/models/PostReaction'
import Share from '@/models/Share'

export const PATCH = async (
  request: Request,
  {
    params
  }: {
    params: Promise<{ shareId: string }>
  }
) => {
  try {
    await client()

    const currentUser = await getCurrentUser()
    const body = await request.json()
    const { type } = body
    const shareId = (await params).shareId

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the share to check who shared it and get original post
    const share = (await Share.findById(shareId)
      .select('sharedBy originalPost')
      .lean()) as any
    if (!share) {
      return new NextResponse('Share not found', { status: 404 })
    }

    // Check if the user has already reacted to the share
    const existingReaction = await PostReaction.findOne({
      postId: shareId,
      userId: currentUser._id
    })

    let reaction
    let isNewReaction = false

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
        postId: shareId,
        type,
        userId: currentUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      await reaction.save()
      isNewReaction = true

      // Add reaction to share if it's new
      await Share.findByIdAndUpdate(shareId, {
        $push: { reactions: reaction._id }
      })
    }

    // Create reaction notification only for new reactions
    if (isNewReaction) {
      try {
        await createReactionNotification(
          currentUser._id.toString(),
          share.sharedBy.toString(),
          share.originalPost.toString(), // Use original post ID for routing
          type,
          shareId // Pass shareId as additional data
        )
      } catch (error) {
        console.error('Error creating reaction notification:', error)
      }
    }

    const updatedShare = await Share.findById(shareId)
      .populate({
        path: 'sharedBy',
        select: 'firstName lastName username profilePicture'
      })
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'firstName lastName username profilePicture'
        }
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
          select: 'firstName lastName username profilePicture'
        }
      })

    if (!updatedShare) {
      return new NextResponse('Share not found', { status: 404 })
    }

    return NextResponse.json(updatedShare)
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
    params: Promise<{ shareId: string }>
  }
) => {
  try {
    await client()

    const currentUser = await getCurrentUser()
    const shareId = (await params).shareId

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Find and delete the reaction
    const deletedReaction = await PostReaction.findOneAndDelete({
      postId: shareId,
      userId: currentUser._id
    })

    if (!deletedReaction) {
      return new NextResponse('Reaction not found', { status: 404 })
    }

    // Remove reaction from share
    await Share.findByIdAndUpdate(shareId, {
      $pull: { reactions: deletedReaction._id }
    })

    // Get updated share
    const updatedShare = await Share.findById(shareId)
      .populate({
        path: 'sharedBy',
        select: 'firstName lastName username profilePicture'
      })
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'firstName lastName username profilePicture'
        }
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
          select: 'firstName lastName username profilePicture'
        }
      })

    if (!updatedShare) {
      return new NextResponse('Share not found', { status: 404 })
    }

    return NextResponse.json(updatedShare)
  } catch (err: any) {
    console.error('Error processing DELETE request:', err)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
