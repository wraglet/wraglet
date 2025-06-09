import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { getAblyInstance } from '@/lib/ably'
import client from '@/lib/db'
import { createShareNotification } from '@/lib/notifications'
import Follow from '@/models/Follow'
import Post from '@/models/Post'
import Share from '@/models/Share'
import { Types } from 'mongoose'

export const POST = async (request: Request) => {
  try {
    await client()

    const currentUser = await getCurrentUser()
    const body = await request.json()
    const { originalPostId, visibility = 'public', message = '' } = body

    if (!currentUser?._id || !currentUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!originalPostId || !Types.ObjectId.isValid(originalPostId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    // Check if the originalPostId is actually a share
    const existingShare = await Share.findById(originalPostId)
    let actualPostId = originalPostId

    // If trying to share a shared post, redirect to share the original post instead
    if (existingShare) {
      actualPostId = existingShare.originalPost.toString()
    }

    // Check if the actual post exists and get author info
    const originalPost = (await Post.findById(actualPostId)
      .select('author')
      .lean()) as any
    if (!originalPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Allow users to share their own posts
    // Check if user has already shared this post (using the actual post ID) - but only if it's not their own post
    if (originalPost.author.toString() !== currentUser._id.toString()) {
      const existingUserShare = await Share.findOne({
        originalPost: actualPostId,
        sharedBy: currentUser._id
      })

      if (existingUserShare) {
        return NextResponse.json(
          { error: 'You have already shared this post' },
          { status: 409 }
        )
      }
    }

    // Create the share (always point to the original post, not the shared post)
    const share = await Share.create({
      originalPost: actualPostId,
      sharedBy: currentUser._id,
      visibility,
      message: message.trim()
    })

    // Create share notification (only if not sharing own post)
    if (originalPost.author.toString() !== currentUser._id.toString()) {
      try {
        await createShareNotification(
          currentUser._id.toString(),
          originalPost.author.toString(),
          actualPostId,
          share._id.toString()
        )
      } catch (error) {
        console.error('Error creating share notification:', error)
      }
    }

    // Increment the share count on the original post
    await Post.findByIdAndUpdate(actualPostId, {
      $inc: { shareCount: 1 }
    })

    // Populate the share with necessary data
    const populatedShare = await Share.findById(share._id)
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

    // Publish to Ably for real-time updates
    try {
      const ably = getAblyInstance()
      const channel = ably.channels.get('post-channel')
      await channel.publish('share', populatedShare)

      // Also publish an update to the original post's shareCount
      const updatedOriginalPost = await Post.findById(actualPostId)
        .populate({
          path: 'author',
          select: 'firstName lastName username profilePicture'
        })
        .lean()

      if (updatedOriginalPost) {
        await channel.publish('post-update', {
          postId: actualPostId,
          shareCount: (updatedOriginalPost as any).shareCount
        })
      }
    } catch (ablyError) {
      console.warn('Failed to publish share to Ably:', ablyError)
      // Don't fail the request if Ably fails
    }

    return NextResponse.json(populatedShare)
  } catch (error: any) {
    console.error('Error creating share:', error)

    // Handle duplicate share (unique index violation)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You have already shared this post' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = async (request: Request) => {
  try {
    await client()

    const currentUser = await getCurrentUser()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor')

    if (!currentUser?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query: any = {}

    // Build query based on visibility and user relationships
    const userFollowingIds = await Follow.find({ followerId: currentUser._id })
      .select('followingId')
      .lean()
    const followingIds = userFollowingIds.map((f) => f.followingId.toString())

    // Get shares that are:
    // 1. Public shares
    // 2. Mutual shares where both users follow each other
    // 3. Only_me shares by the current user
    const mutualFollowingIds = await Follow.find({
      followerId: { $in: followingIds },
      followingId: currentUser._id
    })
      .select('followerId')
      .lean()
    const mutualIds = mutualFollowingIds.map((f) => f.followerId.toString())

    query = {
      $or: [
        { visibility: 'public' },
        {
          visibility: 'mutuals',
          sharedBy: { $in: mutualIds }
        },
        {
          visibility: 'only_me',
          sharedBy: currentUser._id
        }
      ]
    }

    // Add cursor-based pagination
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) }
    }

    const shares = await Share.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
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

    const hasMore = shares.length > limit
    const sharesToReturn = hasMore ? shares.slice(0, -1) : shares
    const nextCursor = hasMore
      ? sharesToReturn[sharesToReturn.length - 1].createdAt.toISOString()
      : null

    return NextResponse.json({
      shares: sharesToReturn,
      nextCursor,
      hasMore
    })
  } catch (error) {
    console.error('Error fetching shares:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
