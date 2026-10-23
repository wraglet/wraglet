import { NextResponse } from 'next/server'
import client from '@/lib/db'
import { deleteR2Object } from '@/lib/media/uploadToR2'
import {
  moderationStatusFromDecision,
  resolveWebhookDecision
} from '@/lib/moderation/nsfwDecision'
import {
  isWorkerRequestAuthorized,
  nsfwDecisionSchema,
  nsfwScoresSchema,
  objectIdSchema,
  quarantineKeySchema,
  readModerationThresholds
} from '@/lib/moderation/webhookAuth'
import { publishPostToFeed } from '@/lib/posts/publishPostToFeed'
import Post from '@/models/Post'
import { z } from 'zod'

const videoAssetSchema = z.object({
  key: z.string().min(1).max(512),
  posterKey: z.string().min(1).max(512).optional(),
  durationSec: z.number().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
})

const videoCompleteSchema = z.object({
  postId: objectIdSchema,
  quarantineKey: quarantineKeySchema.optional(),
  video: videoAssetSchema.optional(),
  scores: nsfwScoresSchema.optional(),
  decision: nsfwDecisionSchema.optional(),
  rejectedReason: z
    .enum(['duration', 'explicit', 'format', 'quota'])
    .optional(),
  error: z.string().max(1000).optional()
})

const publicBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_R2_USERS_URL ?? '').replace(/\/$/, '')

/** Asset keys must live under this post's own prefix; URLs are derived, never trusted. */
const toPostVideo = (
  postId: string,
  video: z.infer<typeof videoAssetSchema>
) => {
  const prefix = `videos/${postId}/`
  if (
    !video.key.startsWith(prefix) ||
    (video.posterKey && !video.posterKey.startsWith(prefix))
  ) {
    return null
  }
  const base = publicBaseUrl()
  return {
    url: `${base}/${video.key}`,
    key: video.key,
    posterUrl: video.posterKey ? `${base}/${video.posterKey}` : undefined,
    posterKey: video.posterKey,
    durationSec: video.durationSec,
    width: video.width,
    height: video.height
  }
}

/**
 * Webhook called by `workers/video-pipeline` when a job finishes (or gives up).
 * Idempotent: only a post that is still `pending` for this quarantine key is updated.
 */
export const POST = async (request: Request) => {
  if (!isWorkerRequestAuthorized(request, process.env.VIDEO_WORKER_SECRET)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    await client()
    const parsed = videoCompleteSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const body = parsed.data

    const post = await Post.findById(body.postId)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const pendingKey = post.moderationMeta?.pendingVideoKey
    if (
      post.moderationStatus !== 'pending' ||
      !pendingKey ||
      (body.quarantineKey && body.quarantineKey !== pendingKey)
    ) {
      return NextResponse.json({ success: true, alreadyProcessed: true })
    }

    const { rejectThreshold, reviewThreshold, strictGray } =
      readModerationThresholds()
    const reviewedAt = new Date()

    // Hard rejects decided by the Worker before classification (bad container, too long).
    if (
      body.rejectedReason === 'duration' ||
      body.rejectedReason === 'format'
    ) {
      post.moderationStatus = 'rejected'
      post.moderationMeta = {
        ...(post.moderationMeta ?? {}),
        rejectedReason: body.rejectedReason,
        reviewedAt
      }
      delete post.moderationMeta.pendingVideoKey
      await post.save()
      await deleteR2Object(pendingKey).catch(() => undefined)
      return NextResponse.json({ success: true, moderationStatus: 'rejected' })
    }

    const decision = resolveWebhookDecision({
      scores: body.scores,
      workerDecision: body.decision,
      rejectThreshold,
      reviewThreshold
    })
    let moderationStatus = moderationStatusFromDecision(decision, strictGray)
    const video = body.video
      ? toPostVideo(post._id.toString(), body.video)
      : null

    if (moderationStatus === 'rejected') {
      post.moderationStatus = 'rejected'
      post.moderationMeta = {
        ...(post.moderationMeta ?? {}),
        imageScores: body.scores,
        rejectedReason: 'explicit',
        reviewedAt
      }
      delete post.moderationMeta.pendingVideoKey
      await post.save()
      await deleteR2Object(pendingKey).catch(() => undefined)
      return NextResponse.json({ success: true, moderationStatus })
    }

    if (!video) {
      // Processing failed or produced no publishable asset: keep the post hidden (and the
      // quarantine object around) until an admin looks at it.
      moderationStatus = 'pending'
    }

    post.moderationStatus = moderationStatus
    post.moderationMeta = {
      ...(post.moderationMeta ?? {}),
      imageScores: body.scores,
      reviewedAt,
      ...(body.error ? { pipelineError: body.error } : {})
    }
    if (video) {
      post.content.video = video
      delete post.moderationMeta.pendingVideoKey
    }
    await post.save()

    if (video && body.quarantineKey) {
      await deleteR2Object(body.quarantineKey).catch(() => undefined)
    }

    if (
      moderationStatus === 'approved' ||
      moderationStatus === 'needs_review'
    ) {
      await publishPostToFeed(post._id.toString())
    }

    return NextResponse.json({ success: true, moderationStatus })
  } catch (error) {
    console.error('video-complete webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
