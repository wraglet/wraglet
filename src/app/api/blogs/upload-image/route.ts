import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { safeApiError } from '@/lib/apiError'
import client from '@/lib/db'
import { createR2S3Client } from '@/lib/r2S3Client'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

import { MAX_FILE_SIZE } from '@/data/constants'

export const POST = async (request: Request) => {
  const s3Client = createR2S3Client()

  try {
    await client()

    const currentUser = await getCurrentUser()
    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { image, type = 'content' } = body

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      )
    }

    const base64Data = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    )

    if (base64Data.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image exceeds maximum file size' },
        { status: 400 }
      )
    }

    const imageType = image.split(';')[0].split('/')[1]
    const folder = type === 'cover' ? 'blogs/covers' : 'blogs/content'
    const key = `${folder}/${uuidv4()}.${imageType}`
    const bucketName = process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: base64Data,
      ContentType: `image/${imageType}`
    })

    await s3Client.send(command)
    const url = `${process.env.NEXT_PUBLIC_R2_USERS_URL}/${key}`

    return NextResponse.json({
      url,
      key
    })
  } catch (error: unknown) {
    console.error('Error uploading blog image:', error)
    return NextResponse.json(
      { error: safeApiError(error, 'Failed to upload image') },
      { status: 500 }
    )
  }
}
