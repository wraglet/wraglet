import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import { ACCEPTED_VIDEO_CONTENT_TYPES } from '@/lib/media/videoContentTypes'
import { createVideoMultipartUpload } from '@/lib/media/videoMultipartUpload'
import {
  assertUserCanUploadVideo,
  getVideoLimits,
  releaseVideoUploadQuota,
  VideoQuotaError
} from '@/lib/media/videoQuota'
import {
  moderatePostText,
  moderationViolationResponse
} from '@/lib/moderation/moderateTextContent'
import Post from '@/models/Post'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const uploadSessionSchema = z.object({
  fileSize: z.number().int().positive(),
  contentType: z.enum(ACCEPTED_VIDEO_CONTENT_TYPES),
  durationSec: z.number().positive().optional(),
  text: z.string().max(280).optional()
})

export const POST = async (request: Request) => {
  let reserved: { userId: string; bytes: number } | null = null
  try {
    await client()
    const currentUser = await getCurrentUser()
    if (!currentUser?._id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = uploadSessionSchema.parse(await request.json())
    const textModeration = moderatePostText(body.text)
    if (!textModeration.ok) {
      return moderationViolationResponse()
    }

    const limits = getVideoLimits()

    if (body.durationSec && body.durationSec > limits.maxDurationSec) {
      return NextResponse.json(
        { error: 'Video exceeds maximum duration' },
        { status: 400 }
      )
    }

    const userId = currentUser._id.toString()
    await assertUserCanUploadVideo(userId, body.fileSize)
    reserved = { userId, bytes: body.fileSize }

    const key = `quarantine/videos/${currentUser._id}/${uuidv4()}.mp4`
    const multipart = await createVideoMultipartUpload({
      key,
      contentType: body.contentType,
      fileSize: body.fileSize
    })

    const post = await Post.create({
      content: body.text ? { text: body.text } : {},
      audience: 'public',
      author: currentUser._id,
      moderationStatus: 'pending',
      moderationMeta: {
        rawBytes: body.fileSize,
        pendingVideoKey: key
      }
    })

    reserved = null
    return NextResponse.json({
      uploadId: multipart.uploadId,
      key,
      partSize: multipart.partSize,
      partCount: multipart.partCount,
      postId: post._id.toString()
    })
  } catch (error) {
    if (reserved) {
      await releaseVideoUploadQuota(reserved.userId, reserved.bytes).catch(
        () => undefined
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid upload session payload' },
        { status: 400 }
      )
    }
    if (error instanceof VideoQuotaError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error('Video upload session error:', error)
    return NextResponse.json(
      { error: 'Failed to create upload session' },
      { status: 500 }
    )
  }
}
