import { DeleteObjectCommand, type S3Client } from '@aws-sdk/client-s3'

/** Only delete objects under paths we own (upload API uses blogs/covers, blogs/content). */
export const isSafeBlogR2Key = (key: string | undefined | null): boolean => {
  const k = key?.trim()
  if (!k) return false
  return k.startsWith('blogs/covers/') || k.startsWith('blogs/content/')
}

type BlogLikeForR2 = {
  coverImage?: { key?: string | null }
  contentBlocks?: Array<{ metadata?: { key?: string | null } | null } | null>
}

export const collectBlogR2Keys = (blog: BlogLikeForR2): string[] => {
  const keys = new Set<string>()
  const cover = blog.coverImage?.key?.trim()
  if (cover && isSafeBlogR2Key(cover)) keys.add(cover)
  for (const block of blog.contentBlocks ?? []) {
    const k = block?.metadata?.key?.trim()
    if (k && isSafeBlogR2Key(k)) keys.add(k)
  }
  return [...keys]
}

/** R2 keys present on `previous` but not on `next` (e.g. after editing content blocks or cover). */
export const blogR2KeysRemovedSinceUpdate = (
  previous: BlogLikeForR2,
  next: BlogLikeForR2
): string[] => {
  const prev = new Set(collectBlogR2Keys(previous))
  const keep = new Set(collectBlogR2Keys(next))
  return [...prev].filter((k) => !keep.has(k))
}

export const deleteBlogKeysFromR2 = async (
  s3Client: S3Client,
  keys: string[]
): Promise<void> => {
  const bucket = process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME
  if (!bucket || keys.length === 0) return

  for (const key of keys) {
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    } catch (error) {
      console.error('Error deleting R2 object:', key, error)
    }
  }
}
