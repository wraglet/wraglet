import { NextResponse } from 'next/server'
import client from '@/lib/db'
import {
  copyQuarantineToPublic,
  deleteR2Object,
  getPublicPrefixForSurface,
  type MediaSurface
} from '@/lib/media/uploadToR2'
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
import User from '@/models/User'
import { z } from 'zod'

const imageCompleteSchema = z.object({
  postId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  key: quarantineKeySchema,
  surface: z.enum(['posts', 'avatars', 'covers', 'gallery']).optional(),
  scores: nsfwScoresSchema.optional(),
  decision: nsfwDecisionSchema.optional()
})

type UserMediaSurface = Exclude<MediaSurface, 'posts' | 'blogs'>

type PendingMediaKey = 'avatarKey' | 'coverKey' | 'galleryKey'
type PendingMedia = Partial<Record<PendingMediaKey, string>>

const PENDING_MEDIA_KEY: Record<UserMediaSurface, PendingMediaKey> = {
  avatars: 'avatarKey',
  covers: 'coverKey',
  gallery: 'galleryKey'
}

const PENDING_MEDIA_FIELD: Record<UserMediaSurface, string> = {
  avatars: 'pendingMedia.avatarKey',
  covers: 'pendingMedia.coverKey',
  gallery: 'pendingMedia.galleryKey'
}

const isUserMediaSurface = (
  surface: MediaSurface
): surface is UserMediaSurface =>
  surface === 'avatars' || surface === 'covers' || surface === 'gallery'

const applyUserMedia = async (input: {
  userId: string
  surface: UserMediaSurface
  publicAsset: { url: string; key: string }
}): Promise<void> => {
  const unsetPending = { [PENDING_MEDIA_FIELD[input.surface]]: 1 }

  if (input.surface === 'gallery') {
    await User.findByIdAndUpdate(input.userId, {
      $push: {
        photoCollection: {
          url: input.publicAsset.url,
          key: input.publicAsset.key,
          type: 'post',
          createdAt: new Date()
        }
      },
      $unset: unsetPending
    })
    return
  }

  const field = input.surface === 'avatars' ? 'profilePicture' : 'coverPhoto'
  const user = await User.findById(input.userId).select(field).lean<{
    profilePicture?: { key?: string }
    coverPhoto?: { key?: string }
  }>()
  const previousKey = user?.[field]?.key

  await User.findByIdAndUpdate(input.userId, {
    $set: { [field]: input.publicAsset },
    $unset: unsetPending
  })

  if (previousKey && previousKey !== input.publicAsset.key) {
    await deleteR2Object(previousKey).catch(() => undefined)
  }
}

/**
 * Webhook called by `workers/moderation-image` once a quarantined image is scored.
 * The Worker's `decision` is advisory: the final decision is recomputed here from the
 * scores and can only be stricter. Idempotent: a key that is no longer pending (already
 * processed, or never issued by us) is acknowledged without touching storage or documents.
 */
export const POST = async (request: Request) => {
  if (
    !isWorkerRequestAuthorized(request, process.env.MODERATION_WORKER_SECRET)
  ) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    await client()
    const parsed = imageCompleteSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const {
      postId,
      userId,
      key,
      scores,
      decision: workerDecision
    } = parsed.data
    const surface: MediaSurface = parsed.data.surface ?? 'posts'

    const { rejectThreshold, reviewThreshold, strictGray } =
      readModerationThresholds()
    const decision = resolveWebhookDecision({
      scores,
      workerDecision,
      rejectThreshold,
      reviewThreshold
    })
    const moderationStatus = moderationStatusFromDecision(decision, strictGray)
    const reviewedAt = new Date()

    // --- Profile media (avatar / cover / gallery) ---------------------------------
    if (userId && isUserMediaSurface(surface)) {
      const user = await User.findById(userId)
        .select('pendingMedia')
        .lean<{ pendingMedia?: PendingMedia }>()
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      if (user.pendingMedia?.[PENDING_MEDIA_KEY[surface]] !== key) {
        return NextResponse.json({ success: true, alreadyProcessed: true })
      }

      if (moderationStatus === 'rejected') {
        await deleteR2Object(key).catch(() => undefined)
        await User.findByIdAndUpdate(userId, {
          $unset: { [PENDING_MEDIA_FIELD[surface]]: 1 }
        })
        return NextResponse.json({ success: true, moderationStatus })
      }

      const publicAsset = await copyQuarantineToPublic(
        key,
        getPublicPrefixForSurface(surface)
      )
      await applyUserMedia({ userId, surface, publicAsset })
      return NextResponse.json({ success: true, moderationStatus })
    }

    // --- Feed posts ----------------------------------------------------------------
    // (Blog images are moderated synchronously in /api/blogs/upload-image.)
    if (surface !== 'posts' || !postId) {
      return NextResponse.json(
        { error: 'Unsupported surface for this webhook' },
        { status: 400 }
      )
    }

    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    if (
      post.moderationStatus !== 'pending' ||
      post.moderationMeta?.pendingImageKey !== key
    ) {
      return NextResponse.json({ success: true, alreadyProcessed: true })
    }

    if (moderationStatus === 'rejected') {
      await deleteR2Object(key).catch(() => undefined)
      post.moderationStatus = 'rejected'
      post.moderationMeta = {
        ...(post.moderationMeta ?? {}),
        imageScores: scores,
        rejectedReason: 'explicit',
        reviewedAt
      }
      delete post.moderationMeta.pendingImageKey
      await post.save()
      return NextResponse.json({ success: true, moderationStatus })
    }

    const publicAsset = await copyQuarantineToPublic(
      key,
      getPublicPrefixForSurface(surface)
    )
    post.content.images = [{ url: publicAsset.url, key: publicAsset.key }]
    post.moderationStatus = moderationStatus
    post.moderationMeta = {
      ...(post.moderationMeta ?? {}),
      imageScores: scores,
      reviewedAt
    }
    delete post.moderationMeta.pendingImageKey
    await post.save()

    if (
      moderationStatus === 'approved' ||
      moderationStatus === 'needs_review'
    ) {
      await publishPostToFeed(post._id.toString())
    }

    return NextResponse.json({ success: true, moderationStatus })
  } catch (error) {
    console.error('image-complete webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
