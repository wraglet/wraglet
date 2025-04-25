import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import Post from '@/models/Post'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Types } from 'mongoose'
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
    await client()

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
      const key = `posts/${uuidv4()}.${type}`
      const bucketName = process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME

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

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const cursor = searchParams.get('cursor')

  try {
    await client()
    const query: any = {}
    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) }
    }
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate({
        path: 'author',
        select: 'firstName lastName username gender pronoun profilePicture'
      })
      .populate({
        path: 'reactions',
        populate: {
          path: 'userId',
          select: 'firstName lastName username profilePicture'
        }
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'firstName lastName username gender pronoun profilePicture'
        }
      })
      .lean()

    const hasMore = posts.length > limit
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts
    const nextCursor = hasMore
      ? postsToReturn[postsToReturn.length - 1]._id
      : null

    return NextResponse.json({
      posts: convertObjectIdsToStrings(postsToReturn),
      nextCursor: nextCursor ? nextCursor.toString() : null
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ posts: [], nextCursor: null }, { status: 500 })
  }
}
