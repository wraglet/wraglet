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
      MultipartUpload: { Parts: input.parts }
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

  return result.ETag.replaceAll('"', '')
}
