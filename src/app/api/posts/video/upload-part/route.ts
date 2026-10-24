import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import {
  maxBytesForPart,
  PART_SIZE,
  uploadVideoPart
} from '@/lib/media/videoMultipartUpload'
import Post from '@/models/Post'

const MAX_PART_NUMBER = 10000

export const POST = async (request: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()
    if (!currentUser?._id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const formData = await request.formData()
    const postId = formData.get('postId')
    const key = formData.get('key')
    const uploadId = formData.get('uploadId')
    const partNumberRaw = formData.get('partNumber')
    const chunk = formData.get('chunk')

    if (
      typeof postId !== 'string' ||
      typeof key !== 'string' ||
      typeof uploadId !== 'string' ||
      typeof partNumberRaw !== 'string' ||
      !(chunk instanceof Blob)
    ) {
      return NextResponse.json(
        { error: 'Invalid upload part payload' },
        { status: 400 }
      )
    }

    const partNumber = Number.parseInt(partNumberRaw, 10)
    if (
      !Number.isInteger(partNumber) ||
      partNumber < 1 ||
      partNumber > MAX_PART_NUMBER
    ) {
      return NextResponse.json(
        { error: 'Invalid part number' },
        { status: 400 }
      )
    }

    if (chunk.size === 0 || chunk.size > PART_SIZE) {
      return NextResponse.json({ error: 'Invalid part size' }, { status: 413 })
    }

    const post = await Post.findById(postId)
      .select('author moderationStatus moderationMeta')
      .lean<{
        author: { toString(): string }
        moderationStatus?: string
        moderationMeta?: { pendingVideoKey?: string; rawBytes?: number }
      }>()
    const authorId = post?.author?.toString()
    if (!post || !authorId || authorId !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (
      post.moderationStatus !== 'pending' ||
      post.moderationMeta?.pendingVideoKey !== key
    ) {
      return NextResponse.json(
        { error: 'Upload session mismatch' },
        { status: 400 }
      )
    }

    // Each part may only fill the bytes still left in the declared (quota-checked) size.
    // A last part capped only at PART_SIZE could store almost 4 MiB more than declared.
    const maxPartBytes = maxBytesForPart(
      post.moderationMeta?.rawBytes ?? 0,
      partNumber
    )
    if (maxPartBytes === 0 || chunk.size > maxPartBytes) {
      return NextResponse.json(
        { error: 'Part exceeds declared file size' },
        { status: 400 }
      )
    }

    const body = Buffer.from(await chunk.arrayBuffer())
    const etag = await uploadVideoPart({
      key,
      uploadId,
      partNumber,
      body
    })

    return NextResponse.json({ etag, partNumber })
  } catch (error) {
    console.error('Video upload part error:', error)
    return NextResponse.json(
      { error: 'Failed to upload video part' },
      { status: 500 }
    )
  }
}
