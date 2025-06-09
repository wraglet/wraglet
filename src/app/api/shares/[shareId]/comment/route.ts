import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { getAblyInstance } from '@/lib/ably'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Comment, { ICommentDocument } from '@/models/Comment'
import Share, { IShareDocument } from '@/models/Share'
import { Types } from 'mongoose'

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ shareId: string }> }
) => {
  const { shareId } = await params
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { content } = await req.json()
    if (!content) {
      return new NextResponse('Content is required', { status: 400 })
    }

    await client()

    // Ensure models are registered
    initModels()

    const share = (await Share.findById(shareId)) as IShareDocument | null
    if (!share) {
      return new NextResponse('Share not found', { status: 404 })
    }

    // Create comment with proper typing
    const comment = (await Comment.create({
      content,
      author: currentUser._id,
      post: share._id
    })) as ICommentDocument

    // Populate the author details with all necessary fields
    await comment.populate({
      path: 'author',
      select: 'firstName lastName username gender pronoun profilePicture'
    })

    // Add comment to share and save
    share.comments = share.comments || []
    share.comments.push(comment._id as unknown as Types.ObjectId)
    await share.save()

    // Try to publish to Ably if available, but don't let it affect the core functionality
    try {
      const ably = getAblyInstance()
      if (ably) {
        const channel = ably.channels.get(`post-${share._id}`)
        await channel
          .publish('comment', comment.toObject())
          .catch((err: Error) => {
            console.warn('Failed to publish to Ably channel:', err)
          })
      }
    } catch (error) {
      // Log the error but don't let it affect the response
      console.warn('Ably publishing failed:', error)
    }

    // Return the populated comment as a plain object (IComment) for UI consumption
    return NextResponse.json(comment.toObject())
  } catch (error) {
    console.error('Error in POST /api/shares/[shareId]/comment:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
