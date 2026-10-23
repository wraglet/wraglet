import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import {
  copyQuarantineToPublic,
  deleteR2Object,
  uploadImageToQuarantine
} from '@/lib/media/uploadToR2'
import { moderateQuarantinedImageSync } from '@/lib/moderation/moderateImageSync'

/**
 * Blog images have no document to update once moderation finishes, so they are
 * classified synchronously and only approved images ever get a public URL.
 */
export const POST = async (request: Request) => {
  try {
    await client()

    const currentUser = await getCurrentUser()
    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { image, type = 'content' } = body

    if (typeof image !== 'string' || !image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    const publicPrefix = type === 'cover' ? 'blogs/covers' : 'blogs/content'

    const uploaded = await uploadImageToQuarantine({
      dataUrl: image,
      surface: 'blogs',
      userId: currentUser._id.toString(),
      publicPrefix
    })

    if (uploaded.moderationStatus === 'approved') {
      if (!uploaded.url || !uploaded.key) {
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        )
      }
      return NextResponse.json({ url: uploaded.url, key: uploaded.key })
    }

    const decision = await moderateQuarantinedImageSync({
      quarantineKey: uploaded.quarantineKey,
      surface: 'blogs',
      userId: currentUser._id.toString()
    })

    if (decision !== 'approve') {
      await deleteR2Object(uploaded.quarantineKey).catch(() => undefined)
      return NextResponse.json(
        { error: 'This image did not pass our content guidelines' },
        { status: 422 }
      )
    }

    const publicAsset = await copyQuarantineToPublic(
      uploaded.quarantineKey,
      publicPrefix
    )
    return NextResponse.json(publicAsset)
  } catch (error: unknown) {
    console.error('Error uploading blog image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
