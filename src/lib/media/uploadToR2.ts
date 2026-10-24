import type { ModerationStatus } from '@/lib/moderation/statusMap'
import { createR2S3Client } from '@/lib/r2S3Client'
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

import { MAX_FILE_SIZE } from '@/data/constants'

export type MediaSurface = 'posts' | 'avatars' | 'covers' | 'gallery' | 'blogs'

const ALLOWED_IMAGE_TYPES = new Set(['jpeg', 'jpg', 'png', 'webp'])
const MAX_IMAGE_DIMENSION = 4096

const MAGIC_BYTES: Array<{ type: string; check: (buf: Buffer) => boolean }> = [
  {
    type: 'jpeg',
    check: (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  },
  {
    type: 'png',
    check: (buf) =>
      buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  },
  {
    type: 'webp',
    check: (buf) =>
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP'
  }
]

export type ProcessedImage = {
  buffer: Buffer
  contentType: string
  extension: string
}

export type UploadImageResult = {
  url: string | null
  key: string | null
  quarantineKey: string
  moderationStatus: ModerationStatus
}

const getBucketName = (): string => {
  const bucket = process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME
  if (!bucket) {
    throw new Error('CLOUDFLARE_R2_USERS_BUCKET_NAME is not configured')
  }
  return bucket
}

const getPublicBaseUrl = (): string => {
  const base = process.env.NEXT_PUBLIC_R2_USERS_URL
  if (!base) {
    throw new Error('NEXT_PUBLIC_R2_USERS_URL is not configured')
  }
  return base.replace(/\/$/, '')
}

export const parseDataUrlImage = (
  dataUrl: string
): { mime: string; buffer: Buffer } => {
  if (!dataUrl.startsWith('data:image/')) {
    throw new Error('Invalid image format')
  }

  const [header, base64] = dataUrl.split(',')
  if (!base64) {
    throw new Error('Invalid image data')
  }

  const mime = header.split(';')[0].replace('data:', '')
  const buffer = Buffer.from(base64, 'base64')

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('Image exceeds maximum file size')
  }

  return { mime, buffer }
}

export const detectImageType = (buffer: Buffer): string | null => {
  for (const entry of MAGIC_BYTES) {
    if (entry.check(buffer)) {
      return entry.type
    }
  }
  return null
}

export const processImageBuffer = async (
  buffer: Buffer
): Promise<ProcessedImage> => {
  const detected = detectImageType(buffer)
  if (!detected || !ALLOWED_IMAGE_TYPES.has(detected)) {
    throw new Error('Unsupported image type')
  }

  let pipeline = sharp(buffer, { failOn: 'none' }).rotate().withMetadata({
    exif: undefined,
    icc: undefined
  })

  const metadata = await pipeline.metadata()
  const width = metadata.width ?? 0
  const height = metadata.height ?? 0

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    pipeline = pipeline.resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true
    })
  }

  if (detected === 'png') {
    const output = await pipeline.png().toBuffer()
    return { buffer: output, contentType: 'image/png', extension: 'png' }
  }

  if (detected === 'webp') {
    const output = await pipeline.webp({ quality: 85 }).toBuffer()
    return { buffer: output, contentType: 'image/webp', extension: 'webp' }
  }

  const output = await pipeline.jpeg({ quality: 85 }).toBuffer()
  return { buffer: output, contentType: 'image/jpeg', extension: 'jpg' }
}

export const shouldAutoApproveImages = (): boolean =>
  process.env.MODERATION_AUTO_APPROVE_IMAGES === 'true' ||
  !process.env.MODERATION_WORKER_URL

export const copyR2Object = async (
  sourceKey: string,
  destKey: string
): Promise<{ url: string; key: string }> => {
  const s3 = createR2S3Client()
  const bucket = getBucketName()

  await s3.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${sourceKey}`,
      Key: destKey,
      MetadataDirective: 'REPLACE'
    })
  )

  return {
    key: destKey,
    url: `${getPublicBaseUrl()}/${destKey}`
  }
}

export const copyQuarantineToPublic = async (
  quarantineKey: string,
  publicPrefix: string
): Promise<{ url: string; key: string }> => {
  const extension = quarantineKey.split('.').pop() ?? 'jpg'
  const publicKey = `${publicPrefix}/${uuidv4()}.${extension}`
  const publicAsset = await copyR2Object(quarantineKey, publicKey)
  await deleteR2Object(quarantineKey)
  return publicAsset
}

export const shouldAutoApproveVideos = (): boolean =>
  process.env.VIDEO_AUTO_APPROVE === 'true' || !process.env.VIDEO_WORKER_URL

export const promoteQuarantineVideo = async (input: {
  quarantineKey: string
  postId: string
  durationSec: number
}): Promise<{
  url: string
  key: string
  posterUrl?: string
  posterKey?: string
  durationSec: number
  width: number
  height: number
}> => {
  const videoKey = `videos/${input.postId}/master.mp4`
  const publicAsset = await copyR2Object(input.quarantineKey, videoKey)
  await deleteR2Object(input.quarantineKey)

  return {
    url: publicAsset.url,
    key: publicAsset.key,
    durationSec: input.durationSec,
    width: 1280,
    height: 720
  }
}

export const deleteR2Object = async (key: string): Promise<void> => {
  const s3 = createR2S3Client()
  await s3.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key
    })
  )
}

export const uploadImageToQuarantine = async (input: {
  dataUrl: string
  surface: MediaSurface
  userId: string
  publicPrefix?: string
}): Promise<UploadImageResult> => {
  const { buffer } = parseDataUrlImage(input.dataUrl)

  const processed = await processImageBuffer(buffer)
  const s3 = createR2S3Client()
  const bucket = getBucketName()
  const quarantineKey = `quarantine/${input.surface}/${input.userId}/${uuidv4()}.${processed.extension}`

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: quarantineKey,
      Body: processed.buffer,
      ContentType: processed.contentType
    })
  )

  const publicPrefix =
    input.publicPrefix ?? getPublicPrefixForSurface(input.surface)

  if (shouldAutoApproveImages()) {
    const publicAsset = await copyQuarantineToPublic(
      quarantineKey,
      publicPrefix
    )
    return {
      url: publicAsset.url,
      key: publicAsset.key,
      quarantineKey,
      moderationStatus: 'approved'
    }
  }

  return {
    url: null,
    key: null,
    quarantineKey,
    moderationStatus: 'pending'
  }
}

/**
 * Hands a quarantined image to `workers/moderation-image`.
 * Call inside `after()` so the serverless function is kept alive until the Worker
 * has accepted the job. Failures are logged and, for posts, recorded on the document.
 */
export const triggerImageModeration = async (input: {
  quarantineKey: string
  postId?: string
  userId?: string
  surface?: MediaSurface
}): Promise<void> => {
  const workerUrl = process.env.MODERATION_WORKER_URL
  const secret = process.env.MODERATION_WORKER_SECRET

  if (!workerUrl || !secret || shouldAutoApproveImages()) {
    return
  }

  const callbackUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/moderation/image-complete`
    : undefined

  let failure: string | null = null
  try {
    const response = await fetch(
      `${workerUrl.replace(/\/$/, '')}/moderate-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`
        },
        body: JSON.stringify({
          key: input.quarantineKey,
          postId: input.postId,
          userId: input.userId,
          surface: input.surface,
          callbackUrl
        })
      }
    )
    if (!response.ok) {
      failure = `Worker responded ${response.status}`
    }
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error)
  }

  if (failure) {
    console.error('Failed to trigger image moderation worker:', failure)
    if (input.postId) {
      const { default: Post } = await import('@/models/Post')
      await Post.findByIdAndUpdate(input.postId, {
        $set: { 'moderationMeta.pipelineError': failure }
      }).catch(() => undefined)
    }
  }
}

export const getPublicPrefixForSurface = (surface: MediaSurface): string => {
  if (surface === 'blogs') {
    return 'blogs/content'
  }
  return surface
}
