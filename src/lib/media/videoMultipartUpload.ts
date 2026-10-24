import { createR2S3Client } from '@/lib/r2S3Client'
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand
} from '@aws-sdk/client-s3'

/** 4 MiB — stays under typical serverless request body limits when proxying parts. */
export const PART_SIZE = 4 * 1024 * 1024

const getBucketName = (): string => {
  const bucket = process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME
  if (!bucket) {
    throw new Error('Storage not configured')
  }
  return bucket
}

export const getPartCount = (fileSize: number): number =>
  Math.ceil(fileSize / PART_SIZE)

/**
 * Largest chunk allowed for this part of a declared upload. Every part is at most
 * `PART_SIZE`, and the last part is only the remainder, so the bytes stored cannot
 * exceed the size the quota check already approved.
 */
export const maxBytesForPart = (
  declaredBytes: number,
  partNumber: number
): number => {
  if (
    !Number.isFinite(declaredBytes) ||
    declaredBytes <= 0 ||
    !Number.isInteger(partNumber) ||
    partNumber < 1
  ) {
    return 0
  }
  const offset = (partNumber - 1) * PART_SIZE
  if (offset >= declaredBytes) {
    return 0
  }
  return Math.min(PART_SIZE, declaredBytes - offset)
}

/**
 * S3 and R2 part ETags are quoted strings (`"abc…"`). CompleteMultipartUpload
 * compares them literally, so a missing pair of quotes is an `InvalidPart`.
 */
export const withQuotedETag = (etag: string): string => {
  const trimmed = etag.trim()
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed
  }
  return `"${trimmed}"`
}

export const completeMultipartUpload = async (input: {
  key: string
  uploadId: string
  parts: Array<{ ETag: string; PartNumber: number }>
}): Promise<void> => {
  const s3 = createR2S3Client()
  await s3.send(
    new CompleteMultipartUploadCommand({
      Bucket: getBucketName(),
      Key: input.key,
      UploadId: input.uploadId,
      MultipartUpload: {
        Parts: input.parts.map((part) => ({
          ...part,
          ETag: withQuotedETag(part.ETag)
        }))
      }
    })
  )
}

export const createVideoMultipartUpload = async (input: {
  key: string
  contentType: string
  fileSize: number
}): Promise<{ uploadId: string; partSize: number; partCount: number }> => {
  const s3 = createR2S3Client()
  const createUpload = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: getBucketName(),
      Key: input.key,
      ContentType: input.contentType
    })
  )

  if (!createUpload.UploadId) {
    throw new Error('Failed to start upload session')
  }

  return {
    uploadId: createUpload.UploadId,
    partSize: PART_SIZE,
    partCount: getPartCount(input.fileSize)
  }
}

export const uploadVideoPart = async (input: {
  key: string
  uploadId: string
  partNumber: number
  body: Buffer
}): Promise<string> => {
  const s3 = createR2S3Client()
  const result = await s3.send(
    new UploadPartCommand({
      Bucket: getBucketName(),
      Key: input.key,
      UploadId: input.uploadId,
      PartNumber: input.partNumber,
      Body: input.body
    })
  )

  if (!result.ETag) {
    throw new Error(`Missing ETag for part ${input.partNumber}`)
  }

  return result.ETag
}
