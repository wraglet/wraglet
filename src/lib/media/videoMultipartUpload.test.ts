import {
  completeMultipartUpload,
  maxBytesForPart,
  PART_SIZE,
  uploadVideoPart,
  withQuotedETag
} from '@/lib/media/videoMultipartUpload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock('@/lib/r2S3Client', () => ({
  createR2S3Client: () => ({ send })
}))

describe('maxBytesForPart', () => {
  it('caps the last part at the undeclared remainder', () => {
    expect(maxBytesForPart(100, 1)).toBe(100)
    expect(maxBytesForPart(PART_SIZE + 100, 1)).toBe(PART_SIZE)
    expect(maxBytesForPart(PART_SIZE + 100, 2)).toBe(100)
    expect(maxBytesForPart(PART_SIZE + 100, 3)).toBe(0)
    expect(maxBytesForPart(0, 1)).toBe(0)
  })
})

describe('withQuotedETag', () => {
  it('wraps a bare ETag and leaves a quoted one alone', () => {
    expect(withQuotedETag('abc123')).toBe('"abc123"')
    expect(withQuotedETag('"abc123"')).toBe('"abc123"')
    expect(withQuotedETag('  "abc"  ')).toBe('"abc"')
  })
})

describe('multipart ETags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME = 'bucket'
  })

  it('returns the UploadPart ETag exactly as S3 sent it', async () => {
    send.mockResolvedValue({ ETag: '"d41d8cd98f00b204e9800998ecf8427e"' })
    await expect(
      uploadVideoPart({
        key: 'quarantine/videos/u/a.mp4',
        uploadId: 'upload-1',
        partNumber: 1,
        body: Buffer.from('part')
      })
    ).resolves.toBe('"d41d8cd98f00b204e9800998ecf8427e"')
  })

  it('quotes ETags before CompleteMultipartUpload', async () => {
    send.mockResolvedValue({})
    await completeMultipartUpload({
      key: 'quarantine/videos/u/a.mp4',
      uploadId: 'upload-1',
      parts: [
        { ETag: 'abc', PartNumber: 1 },
        { ETag: '"def"', PartNumber: 2 }
      ]
    })
    expect(send.mock.calls[0][0].input.MultipartUpload.Parts).toEqual([
      { ETag: '"abc"', PartNumber: 1 },
      { ETag: '"def"', PartNumber: 2 }
    ])
  })
})
