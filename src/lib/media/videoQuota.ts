import Post from '@/models/Post'
import User from '@/models/User'

const DAY_MS = 24 * 60 * 60 * 1000

/** Thrown for user-facing quota/limit violations (safe to echo to the client). */
export class VideoQuotaError extends Error {
  readonly status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'VideoQuotaError'
    this.status = status
  }
}

export const getVideoLimits = () => ({
  maxDurationSec: Number(process.env.VIDEO_MAX_DURATION_SEC ?? 600),
  maxUploadBytes: Number(process.env.VIDEO_MAX_UPLOAD_BYTES ?? 209715200),
  dailyCount: Number(process.env.VIDEO_USER_DAILY_COUNT ?? 5),
  dailyBytes: Number(process.env.VIDEO_USER_DAILY_BYTES ?? 524288000)
})

/**
 * Enforces per-user video limits. Every upload *session* counts (pending, rejected or
 * published) so abandoning or failing uploads cannot be used to bypass the quota.
 */
export const assertUserCanUploadVideo = async (
  userId: string,
  fileSize: number
): Promise<void> => {
  const limits = getVideoLimits()

  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    throw new VideoQuotaError('Invalid video file size')
  }
  if (fileSize > limits.maxUploadBytes) {
    throw new VideoQuotaError('Video file exceeds maximum upload size', 413)
  }

  const user = await User.findById(userId)
    .select('uploadRestrictedUntil')
    .lean<{ uploadRestrictedUntil?: Date | string | null }>()

  if (
    user?.uploadRestrictedUntil &&
    new Date(user.uploadRestrictedUntil).getTime() > Date.now()
  ) {
    throw new VideoQuotaError('Uploads temporarily restricted', 403)
  }

  const since = new Date(Date.now() - DAY_MS)
  const recentSessions = await Post.find({
    author: userId,
    createdAt: { $gte: since },
    'moderationMeta.rawBytes': { $exists: true }
  })
    .select('moderationMeta.rawBytes')
    .lean<Array<{ moderationMeta?: { rawBytes?: number } }>>()

  if (recentSessions.length >= limits.dailyCount) {
    throw new VideoQuotaError('Daily video upload limit reached', 429)
  }

  const bytesToday = recentSessions.reduce(
    (sum, post) => sum + (post.moderationMeta?.rawBytes ?? 0),
    0
  )
  if (bytesToday + fileSize > limits.dailyBytes) {
    throw new VideoQuotaError('Daily video upload size limit reached', 429)
  }
}
