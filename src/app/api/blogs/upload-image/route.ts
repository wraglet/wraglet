import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client({
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ?? ''
  }
})

export const POST = async (request: Request) => {
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

    // Upload image to R2
    const uploadImageToR2 = async (
      image: string,
      type: string
    ): Promise<{ url: string; key: string }> => {
      const base64Data = Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      )
      const imageType = image.split(';')[0].split('/')[1]

      // Organize images by type in R2
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
      return { url, key }
    }

    const uploadedImage = await uploadImageToR2(image, type)

    return NextResponse.json({
      url: uploadedImage.url,
      key: uploadedImage.key
    })
  } catch (error: any) {
    console.error('Error uploading blog image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}
