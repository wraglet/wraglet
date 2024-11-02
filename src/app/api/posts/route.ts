import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import Post from '@/models/Post'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export const POST = async (request: Request) => {
  const s3Client = new S3Client({
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: 'auto',
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ?? ''
    }
  })

  try {
    await mongoose.connect(process.env.MONGODB_URI!)

    const currentUser = await getCurrentUser()
    const body = await request.json()
    const { text, audience = 'public', image } = body

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const uploadImageToR2 = async (
      image: string
    ): Promise<{ url: string; key: string }> => {
      const base64Data = Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      )
      const type = image.split(';')[0].split('/')[1]
      const key = `user/post/${uuidv4()}.${type}`
      const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: base64Data,
        ContentType: `image/${type}`
      })

      await s3Client.send(command)
      const url = `${process.env.NEXT_PUBLIC_R2_USERS_URL}/${key}`
      return { url, key }
    }

    let content = {}

    if (text && image) {
      const imageUrl = await uploadImageToR2(image)
      content = { text, images: [imageUrl] }
    } else if (text) {
      content = { text }
    } else if (image) {
      const imageUrl = await uploadImageToR2(image)
      content = { images: [imageUrl] }
    } else {
      return new NextResponse('Text or image is required', { status: 400 })
    }

    const newPost = await Post.create({
      content,
      audience,
      author: currentUser._id
    })

    const populatedPost = await Post.findById(newPost._id)
      .populate({
        path: 'author',
        select:
          'id firstName lastName email dob gender bio pronoun profilePicture coverPhoto createdAt updatedAt'
      })
      .exec()

    return NextResponse.json(populatedPost)
  } catch (err: any) {
    console.log('Fetching posts error: ', err)
    console.error(
      'Error happened while doing POST for /api/posts at route.ts: ',
      err
    )
    return new NextResponse('Internal Error: ', { status: 500 })
  }
}
