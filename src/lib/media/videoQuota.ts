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

const windowStart = () => new Date(Date.now() - DAY_MS)

/**
 * Reserves one upload against the user's 24h window in a single document update.
 * MongoDB applies the filter and the increment together, so two concurrent
 * sessions cannot both pass a limit the first one has already consumed.
 * Call `releaseVideoUploadQuota` if the session is abandoned before a post exists.
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
  if (fileSize > limits.dailyBytes) {
    throw new VideoQuotaError('Daily video upload size limit reached', 429)
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

  const since = windowStart()
  const now = new Date()
  const reserved = await User.updateOne(
    {
      _id: userId,
      $or: [
        { 'videoUploadUsage.windowStart': { $exists: false } },
        { 'videoUploadUsage.windowStart': null },
        { 'videoUploadUsage.windowStart': { $lt: since } },
        {
          'videoUploadUsage.windowStart': { $gte: since },
          'videoUploadUsage.count': { $lt: limits.dailyCount },
          'videoUploadUsage.bytes': { $lte: limits.dailyBytes - fileSize }
        }
      ]
    },
    [
      {
        $set: {
          videoUploadUsage: {
            $cond: [
              {
                $lt: [
                  { $ifNull: ['$videoUploadUsage.windowStart', new Date(0)] },
                  since
                ]
              },
              { windowStart: now, count: 1, bytes: fileSize },
              {
                windowStart: '$videoUploadUsage.windowStart',
                count: {
                  $add: [{ $ifNull: ['$videoUploadUsage.count', 0] }, 1]
                },
                bytes: {
                  $add: [{ $ifNull: ['$videoUploadUsage.bytes', 0] }, fileSize]
                }
              }
            ]
          }
        }
      }
    ]
  )

  if (reserved.matchedCount > 0) {
    return
  }

  const usage = await User.findById(userId).select('videoUploadUsage').lean<{
    videoUploadUsage?: { windowStart?: Date; count?: number; bytes?: number }
  }>()
  const inWindow =
    usage?.videoUploadUsage?.windowStart &&
    new Date(usage.videoUploadUsage.windowStart).getTime() >= since.getTime()

  if (inWindow && (usage?.videoUploadUsage?.count ?? 0) >= limits.dailyCount) {
    throw new VideoQuotaError('Daily video upload limit reached', 429)
  }
  throw new VideoQuotaError('Daily video upload size limit reached', 429)
}

/** Gives back a reservation when the upload session is not created. */
export const releaseVideoUploadQuota = async (
  userId: string,
  fileSize: number
): Promise<void> => {
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return
  }
  await User.updateOne(
    {
      _id: userId,
      'videoUploadUsage.windowStart': { $gte: windowStart() },
      'videoUploadUsage.count': { $gte: 1 },
      'videoUploadUsage.bytes': { $gte: fileSize }
    },
    {
      $inc: {
        'videoUploadUsage.count': -1,
        'videoUploadUsage.bytes': -fileSize
      }
    }
  )
}
