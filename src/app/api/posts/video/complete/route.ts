import { after, NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import {
  promoteQuarantineVideo,
  shouldAutoApproveVideos
} from '@/lib/media/uploadToR2'
import { completeMultipartUpload } from '@/lib/media/videoMultipartUpload'
import { triggerVideoPipeline } from '@/lib/media/videoPipeline'
import { getVideoLimits } from '@/lib/media/videoQuota'
import { publishPostToFeed } from '@/lib/posts/publishPostToFeed'
import Post from '@/models/Post'
import { z } from 'zod'

const completeSchema = z.object({
  postId: z.string().regex(/^[0-9a-f]{24}$/i),
  key: z.string().min(1).max(512),
  uploadId: z.string().min(1).max(1024),
  parts: z
    .array(
      z.object({
        ETag: z.string().min(1).max(256),
        PartNumber: z.number().int().positive()
      })
    )
    .min(1)
    .max(10000),
  durationSec: z.number().positive()
})

export const POST = async (request: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()
    if (!currentUser?._id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = completeSchema.parse(await request.json())
    const limits = getVideoLimits()

    if (body.durationSec > limits.maxDurationSec) {
      return NextResponse.json(
        { error: 'Video exceeds maximum duration' },
        { status: 400 }
      )
    }

    const post = await Post.findById(body.postId)
    if (!post || post.author.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // The key must be the one issued by /upload-session for this post; otherwise a user
    // could complete (and later publish) an arbitrary object.
    if (
      post.moderationStatus !== 'pending' ||
      post.moderationMeta?.pendingVideoKey !== body.key
    ) {
      return NextResponse.json(
        { error: 'Upload session mismatch' },
        { status: 400 }
      )
    }

    await completeMultipartUpload({
      key: body.key,
      uploadId: body.uploadId,
      parts: body.parts
    })

    if (shouldAutoApproveVideos()) {
      const video = await promoteQuarantineVideo({
        quarantineKey: body.key,
        postId: post._id.toString(),
        durationSec: body.durationSec
      })
      post.content.video = video
      post.moderationStatus = 'approved'
      post.moderationMeta = {
        ...(post.moderationMeta ?? {}),
        reviewedAt: new Date()
      }
      delete post.moderationMeta.pendingVideoKey
      await post.save()

      await publishPostToFeed(post._id.toString())

      return NextResponse.json({
        success: true,
        postId: post._id.toString(),
        moderationStatus: post.moderationStatus
      })
    }

    // `after` keeps the serverless function alive until the Worker has accepted the job
    // (it responds 202 immediately and processes via a Cloudflare Queue).
    after(() =>
      triggerVideoPipeline({
        postId: post._id.toString(),
        quarantineKey: body.key,
        durationSec: body.durationSec
      })
    )

    return NextResponse.json({
      success: true,
      postId: post._id.toString(),
      moderationStatus: post.moderationStatus
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid complete payload' },
        { status: 400 }
      )
    }
    console.error('Video complete error:', error)
    return NextResponse.json(
      { error: 'Failed to complete video upload' },
      { status: 500 }
    )
  }
}
