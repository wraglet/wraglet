import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import PostVote from '@/models/PostVote'
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
    const { voteType } = body
    const shareId = (await params).shareId

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if the user has already voted on the share
    const existingVote = await PostVote.findOne({
      postId: shareId,
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

      // Update vote in share's votes array
      await Share.findByIdAndUpdate(
        shareId,
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
        postId: shareId,
        voteType,
        userId: currentUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      await vote.save()

      // Add vote to share if it's new
      await Share.findByIdAndUpdate(shareId, {
        $push: { votes: vote }
      })
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

    // Find and remove the vote
    const vote = await PostVote.findOneAndDelete({
      postId: shareId,
      userId: currentUser._id
    })

    if (vote) {
      // Remove vote from share using the vote's _id
      await Share.findByIdAndUpdate(shareId, {
        $pull: { votes: { _id: vote._id } }
      })
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
    console.error('Error processing DELETE request:', err)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
