import { probeMp4DurationSec } from '../../shared/mp4'
import {
  classifyForModeration,
  type AiBinding,
  type ClassificationResult,
  type ClefImage
} from '../../shared/nsfw'
import {
  isAllowedCallbackUrl,
  isBearerAuthorized,
  isObjectIdString,
  isQuarantineKey
} from '../../shared/security'

/** Media Transformations binding (subset we use). */
type MediaOutputOptions = {
  mode: 'video' | 'frame' | 'spritesheet' | 'audio'
  time?: string
  duration?: string
  format?: 'jpg' | 'png' | 'm4a'
  audio?: boolean
}
type MediaTransformOptions = {
  width?: number
  height?: number
  fit?: 'contain' | 'cover' | 'scale-down'
}
type MediaResult = { response(): Promise<Response> }
type MediaOutputStage = { output(options: MediaOutputOptions): MediaResult }
type MediaBinding = {
  input(stream: ReadableStream<Uint8Array>): MediaOutputStage & {
    transform(options: MediaTransformOptions): MediaOutputStage
  }
}

export interface Env {
  VIDEO_WORKER_SECRET: string
  /** `production` | `staging` | `development`; test overrides are refused in production. */
  ENVIRONMENT?: string
  /** Comma-separated hostnames the Worker may call back (defaults to any https host). */
  ALLOWED_CALLBACK_HOSTS?: string
  VIDEO_MAX_DURATION_SEC?: string
  MODERATION_NSFW_REJECT_THRESHOLD?: string
  MODERATION_NSFW_REVIEW_THRESHOLD?: string
  NEXT_PUBLIC_R2_USERS_URL?: string
  NSFW_MODEL?: string
  /** Staging-only: force a synthetic explicit score (0..1). */
  TEST_NSFW_EXPLICIT_SCORE?: string
  R2_BUCKET?: R2Bucket
  AI?: AiBinding
  MEDIA?: MediaBinding
  VIDEO_QUEUE?: Queue<VideoJob>
}

export type VideoJob = {
  postId: string
  key: string
  durationSec: number
  callbackUrl?: string
}

type ProcessVideoRequest = VideoJob & { bucket?: string }

type VideoAsset = {
  url: string
  key: string
  posterUrl?: string
  posterKey?: string
  durationSec: number
  width: number
  height: number
}

type CallbackPayload = {
  postId: string
  quarantineKey?: string
  scores?: ClassificationResult['scores']
  decision?: ClassificationResult['decision']
  rejectedReason?: 'duration' | 'explicit' | 'format' | 'quota'
  video?: VideoAsset
  model?: string
  error?: string
}

/** Media Transformations hard limits (input ≤100 MB, output video ≤60 s). */
const MEDIA_MAX_INPUT_BYTES = 100 * 1024 * 1024
const MEDIA_MAX_TRANSCODE_SEC = 60
const TARGET_WIDTH = 1280
const TARGET_HEIGHT = 720
const MIN_FRAMES = 4
const MAX_FRAMES = 12
const FRAME_INTERVAL_SEC = 5
/** Tolerance between the client-reported duration and the container's own `mvhd`. */
const DURATION_MISMATCH_TOLERANCE_SEC = 2

const getMaxDurationSec = (env: Env): number =>
  Number(env.VIDEO_MAX_DURATION_SEC ?? 600)

const getTestOverride = (env: Env): string | undefined =>
  env.ENVIRONMENT === 'production' ? undefined : env.TEST_NSFW_EXPLICIT_SCORE

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

const log = (event: string, data: Record<string, unknown>): void => {
  console.log(JSON.stringify({ event, ...data }))
}

const sendCallback = async (
  env: Env,
  callbackUrl: string | undefined,
  payload: CallbackPayload
) => {
  if (!callbackUrl) return
  try {
    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.VIDEO_WORKER_SECRET}`
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      console.error(
        'Callback to wraglet failed:',
        response.status,
        await response.text()
      )
    }
  } catch (error) {
    console.error('Callback to wraglet failed:', error)
  }
}

/** Evenly spaced integer timestamps, clamped inside the video. */
export const sampleTimestamps = (durationSec: number): number[] => {
  const count = Math.min(
    MAX_FRAMES,
    Math.max(MIN_FRAMES, Math.ceil(durationSec / FRAME_INTERVAL_SEC))
  )
  const maxTime = Math.max(0, Math.floor(durationSec - 0.5))
  const times = new Set<number>()
  for (let i = 0; i < count; i += 1) {
    const t = Math.floor((durationSec * (i + 0.5)) / count)
    times.add(Math.min(maxTime, Math.max(0, t)))
  }
  return [...times].sort((a, b) => a - b)
}

/** Reads width/height from a JPEG SOF marker (no image decoder in Workers). */
export const readJpegDimensions = (
  bytes: Uint8Array
): { width: number; height: number } | null => {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  let i = 2
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i += 1
      continue
    }
    const marker = bytes[i + 1]
    if (marker === 0xff) {
      i += 1
      continue
    }
    if (
      marker === 0xd8 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      i += 2
      continue
    }
    const length = (bytes[i + 2] << 8) | bytes[i + 3]
    const isSof =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    if (isSof) {
      const height = (bytes[i + 5] << 8) | bytes[i + 6]
      const width = (bytes[i + 7] << 8) | bytes[i + 8]
      return width > 0 && height > 0 ? { width, height } : null
    }
    i += 2 + length
  }
  return null
}

/** Mirrors Media Transformations `fit: scale-down` so we can report accurate dimensions. */
export const scaleDown = (
  size: { width: number; height: number },
  maxWidth = TARGET_WIDTH,
  maxHeight = TARGET_HEIGHT
): { width: number; height: number } => {
  if (size.width <= maxWidth && size.height <= maxHeight) return size
  const ratio = Math.min(maxWidth / size.width, maxHeight / size.height)
  const even = (n: number) => Math.max(2, Math.round((n * ratio) / 2) * 2)
  return { width: even(size.width), height: even(size.height) }
}

const getSourceStream = async (
  env: Env,
  key: string
): Promise<ReadableStream<Uint8Array> | null> => {
  const object = await env.R2_BUCKET?.get(key)
  return object?.body ?? null
}

const extractFrame = async (
  env: Env,
  key: string,
  timeSec: number,
  transform?: MediaTransformOptions
): Promise<Uint8Array | null> => {
  if (!env.MEDIA) return null
  const stream = await getSourceStream(env, key)
  if (!stream) return null
  try {
    const stage = env.MEDIA.input(stream)
    const output = (transform ? stage.transform(transform) : stage).output({
      mode: 'frame',
      time: `${timeSec}s`,
      format: 'jpg'
    })
    const response = await output.response()
    if (!response.ok) {
      console.error(
        'Frame extraction failed:',
        timeSec,
        response.status,
        await response.text()
      )
      return null
    }
    return new Uint8Array(await response.arrayBuffer())
  } catch (error) {
    console.error('Frame extraction threw:', timeSec, error)
    return null
  }
}

const transcodeShortClip = async (
  env: Env,
  key: string,
  durationSec: number
): Promise<Uint8Array | null> => {
  if (!env.MEDIA) return null
  const stream = await getSourceStream(env, key)
  if (!stream) return null
  try {
    const response = await env.MEDIA.input(stream)
      .transform({
        width: TARGET_WIDTH,
        height: TARGET_HEIGHT,
        fit: 'scale-down'
      })
      .output({
        mode: 'video',
        time: '0s',
        duration: `${Math.ceil(durationSec)}s`,
        audio: true
      })
      .response()
    if (!response.ok) {
      console.error('Transcode failed:', response.status, await response.text())
      return null
    }
    return new Uint8Array(await response.arrayBuffer())
  } catch (error) {
    console.error('Transcode threw:', error)
    return null
  }
}

/** Streams the original quarantine object to the public key without buffering it in memory. */
const copyOriginal = async (
  env: Env,
  fromKey: string,
  toKey: string,
  size: number
): Promise<void> => {
  const source = await env.R2_BUCKET?.get(fromKey)
  if (!source) {
    throw new Error('Source video disappeared from quarantine')
  }
  const fixed = new FixedLengthStream(size)
  // The pipe must run concurrently with the upload (R2 consumes `readable`), but its
  // failure has to surface too, otherwise a truncated copy would be reported as success.
  const piped = source.body.pipeTo(fixed.writable)
  await Promise.all([
    env.R2_BUCKET!.put(toKey, fixed.readable, {
      httpMetadata: {
        contentType: source.httpMetadata?.contentType ?? 'video/mp4'
      }
    }),
    piped
  ])
}

/** Real duration from the MP4/MOV container; null when the file is not ISO BMFF or is malformed. */
const probeDuration = async (
  env: Env,
  key: string,
  fileSize: number
): Promise<number | null> => {
  const bucket = env.R2_BUCKET
  if (!bucket) return null
  try {
    return await probeMp4DurationSec(async (offset, length) => {
      const object = await bucket.get(key, { range: { offset, length } })
      if (!object) return null
      return new Uint8Array(await object.arrayBuffer())
    }, fileSize)
  } catch (error) {
    console.error('Duration probe threw:', error)
    return null
  }
}

const describeNoFramesReason = (
  canTransform: boolean,
  hasMediaBinding: boolean
): string => {
  if (canTransform) {
    return 'Frame extraction produced no frames'
  }
  if (hasMediaBinding) {
    return `Video larger than ${MEDIA_MAX_INPUT_BYTES} bytes; cannot sample frames`
  }
  return 'MEDIA binding not configured'
}

/**
 * Full pipeline for one video. Throws only on infrastructure failures that are
 * worth retrying (R2 copy). Classification failures fail closed to `review`.
 */
export const processVideo = async (
  env: Env,
  job: VideoJob
): Promise<CallbackPayload> => {
  if (!env.R2_BUCKET) {
    throw new Error('R2 bucket not bound')
  }

  const head = await env.R2_BUCKET.head(job.key)
  if (!head) {
    return {
      postId: job.postId,
      quarantineKey: job.key,
      rejectedReason: 'format',
      error: 'Source video not found in quarantine'
    }
  }

  // 0. Never trust the client-reported duration: it drives frame sampling, so an
  //    understated value would let the tail of a video skip classification.
  const probedDuration = await probeDuration(env, job.key, head.size)
  if (probedDuration === null) {
    return {
      postId: job.postId,
      quarantineKey: job.key,
      rejectedReason: 'format',
      error: 'Unsupported or malformed video container (expected MP4/MOV)'
    }
  }
  const durationSec = probedDuration
  if (durationSec < 1 || durationSec > getMaxDurationSec(env)) {
    return {
      postId: job.postId,
      quarantineKey: job.key,
      rejectedReason: 'duration',
      error: `Container duration ${durationSec.toFixed(1)}s is out of range`
    }
  }
  if (
    Math.abs(durationSec - job.durationSec) > DURATION_MISMATCH_TOLERANCE_SEC
  ) {
    log('video_duration_mismatch', {
      postId: job.postId,
      reported: job.durationSec,
      probed: durationSec
    })
  }

  const rejectThreshold = Number(env.MODERATION_NSFW_REJECT_THRESHOLD ?? 0.85)
  const reviewThreshold = Number(env.MODERATION_NSFW_REVIEW_THRESHOLD ?? 0.5)
  const canTransform = Boolean(env.MEDIA) && head.size <= MEDIA_MAX_INPUT_BYTES
  const testOverride = getTestOverride(env)

  // 1. Sample frames (720px wide JPEGs) for classification.
  const frames: ClefImage[] = []
  let posterSource: Uint8Array | null = null
  const timestamps = sampleTimestamps(durationSec)

  if (canTransform) {
    const extracted = await Promise.all(
      timestamps.map((t) =>
        extractFrame(env, job.key, t, { width: 720, fit: 'scale-down' })
      )
    )
    for (const frame of extracted) {
      if (frame)
        frames.push({ content_type: 'image/jpeg', base64: base64(frame) })
    }
    // Poster: full-resolution frame near the start (also tells us the source dimensions).
    posterSource = await extractFrame(env, job.key, timestamps[0] ?? 0)
  }

  // 2. Classify. No frames → review (fail closed) but keep going so admins can watch it.
  const classification: ClassificationResult =
    frames.length > 0 || testOverride
      ? await classifyForModeration({
          ai: env.AI,
          images: frames,
          model: env.NSFW_MODEL,
          rejectThreshold,
          reviewThreshold,
          testExplicitOverride: testOverride
        })
      : {
          scores: {},
          decision: 'review',
          maxExplicit: 0,
          model: env.NSFW_MODEL ?? 'none',
          error: describeNoFramesReason(canTransform, Boolean(env.MEDIA))
        }

  log('video_classified', {
    postId: job.postId,
    frames: frames.length,
    decision: classification.decision,
    maxExplicit: classification.maxExplicit,
    gore: classification.scores.Gore,
    minorSexual: classification.scores.MinorSexual,
    model: classification.model,
    error: classification.error
  })

  if (classification.decision === 'reject') {
    return {
      postId: job.postId,
      quarantineKey: job.key,
      scores: classification.scores,
      decision: 'reject',
      rejectedReason: 'explicit',
      model: classification.model
    }
  }

  // 3. Publish assets.
  const publicVideoKey = `videos/${job.postId}/master.mp4`
  const publicPosterKey = `videos/${job.postId}/poster.jpg`
  const publicBase = (env.NEXT_PUBLIC_R2_USERS_URL ?? '').replace(/\/$/, '')

  const sourceDimensions = posterSource
    ? readJpegDimensions(posterSource)
    : null
  let dimensions = sourceDimensions ?? {
    width: TARGET_WIDTH,
    height: TARGET_HEIGHT
  }

  let posterKey: string | undefined
  if (posterSource) {
    await env.R2_BUCKET.put(publicPosterKey, posterSource, {
      httpMetadata: { contentType: 'image/jpeg' }
    })
    posterKey = publicPosterKey
  }

  let transcoded = false
  if (canTransform && durationSec <= MEDIA_MAX_TRANSCODE_SEC) {
    const clip = await transcodeShortClip(env, job.key, durationSec)
    if (clip && clip.byteLength > 0) {
      await env.R2_BUCKET.put(publicVideoKey, clip, {
        httpMetadata: { contentType: 'video/mp4' }
      })
      dimensions = scaleDown(dimensions)
      transcoded = true
    }
  }
  if (!transcoded) {
    await copyOriginal(env, job.key, publicVideoKey, head.size)
  }

  log('video_published', {
    postId: job.postId,
    transcoded,
    bytes: head.size,
    width: dimensions.width,
    height: dimensions.height,
    poster: Boolean(posterKey)
  })

  return {
    postId: job.postId,
    quarantineKey: job.key,
    scores: classification.scores,
    decision: classification.decision,
    model: classification.model,
    error: classification.error,
    video: {
      url: `${publicBase}/${publicVideoKey}`,
      key: publicVideoKey,
      posterUrl: posterKey ? `${publicBase}/${posterKey}` : undefined,
      posterKey,
      durationSec: Math.round(durationSec * 100) / 100,
      width: dimensions.width,
      height: dimensions.height
    }
  }
}

const base64 = (bytes: Uint8Array): string => {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

const runJob = async (env: Env, job: VideoJob): Promise<CallbackPayload> => {
  const payload = await processVideo(env, job)
  await sendCallback(env, job.callbackUrl, payload)
  return payload
}

const videoPipelineWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method !== 'POST' || url.pathname !== '/process-video') {
      return new Response('Not found', { status: 404 })
    }

    if (
      !isBearerAuthorized(
        request.headers.get('authorization'),
        env.VIDEO_WORKER_SECRET
      )
    ) {
      return json({ error: 'Unauthorized' }, 401)
    }

    let body: ProcessVideoRequest
    try {
      body = (await request.json()) as ProcessVideoRequest
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }

    if (
      !isObjectIdString(body.postId) ||
      !isQuarantineKey(body.key) ||
      typeof body.durationSec !== 'number' ||
      !Number.isFinite(body.durationSec)
    ) {
      return json({ error: 'Invalid payload' }, 400)
    }
    if (
      body.callbackUrl !== undefined &&
      !isAllowedCallbackUrl(body.callbackUrl, env.ALLOWED_CALLBACK_HOSTS)
    ) {
      return json({ error: 'callbackUrl not allowed' }, 400)
    }

    const maxDuration = getMaxDurationSec(env)
    if (body.durationSec < 1 || body.durationSec > maxDuration) {
      await sendCallback(env, body.callbackUrl, {
        postId: body.postId,
        quarantineKey: body.key,
        rejectedReason: 'duration'
      })
      return json({ success: true, rejected: true, rejectedReason: 'duration' })
    }

    const job: VideoJob = {
      postId: body.postId,
      key: body.key,
      durationSec: body.durationSec,
      callbackUrl: body.callbackUrl
    }

    if (env.VIDEO_QUEUE) {
      await env.VIDEO_QUEUE.send(job)
      log('video_queued', {
        postId: job.postId,
        key: job.key,
        durationSec: job.durationSec
      })
      return json({ success: true, queued: true }, 202)
    }

    // No queue bound (local dev): process inline.
    try {
      const payload = await runJob(env, job)
      return json({
        success: true,
        queued: false,
        decision: payload.decision,
        video: payload.video
      })
    } catch (error) {
      console.error('Inline video processing failed:', error)
      return json({ error: 'Video processing failed' }, 500)
    }
  },

  async queue(batch: MessageBatch<VideoJob>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const job = message.body
      try {
        await runJob(env, job)
        message.ack()
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        const isLastAttempt = message.attempts >= MAX_QUEUE_ATTEMPTS
        console.error(
          `Video job failed (attempt ${message.attempts}/${MAX_QUEUE_ATTEMPTS}) for post ${job.postId}:`,
          errorMessage
        )
        if (isLastAttempt) {
          // Give up: leave the quarantine object in place (no quarantineKey) and ask for human review.
          await sendCallback(env, job.callbackUrl, {
            postId: job.postId,
            scores: {},
            decision: 'review',
            error: `Video processing failed after ${message.attempts} attempts: ${errorMessage}`
          })
          message.ack()
        } else {
          message.retry({ delaySeconds: 30 * message.attempts })
        }
      }
    }
  }
}

/** Keep in sync with `max_retries` in wrangler.toml (attempts = retries + 1). */
const MAX_QUEUE_ATTEMPTS = 4

export default videoPipelineWorker
