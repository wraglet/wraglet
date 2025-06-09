import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import Follow from '@/models/Follow'
import Post from '@/models/Post'
import Share from '@/models/Share'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
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

    const currentUser = await getCurrentUser()
    if (!currentUser?._id) {
      return NextResponse.json({ posts: [], nextCursor: null }, { status: 401 })
    }

    // Build query for pagination
    let query: any = {}
    let shareQuery: any = {}

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) }
      shareQuery.createdAt = { $lt: new Date(cursor) }
    }

    // Get user's following list for mutual shares
    const userFollowingIds = await Follow.find({ followerId: currentUser._id })
      .select('followingId')
      .lean()
    const followingIds = userFollowingIds.map((f) => f.followingId.toString())

    const mutualFollowingIds = await Follow.find({
      followerId: { $in: followingIds },
      followingId: currentUser._id
    })
      .select('followerId')
      .lean()
    const mutualIds = mutualFollowingIds.map((f) => f.followerId.toString())

    // Fetch regular posts
    const postsPromise = Post.find(query)
      .sort({ createdAt: -1 })
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

    // Fetch shared posts
    const shareQueryWithVisibility = {
      ...shareQuery,
      $or: [
        { visibility: 'public' },
        {
          visibility: 'mutuals',
          sharedBy: { $in: mutualIds }
        },
        {
          visibility: 'only_me',
          sharedBy: currentUser._id
        }
      ]
    }

    const sharesPromise = Share.find(shareQueryWithVisibility)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate({
        path: 'sharedBy',
        select: 'firstName lastName username profilePicture'
      })
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'firstName lastName username profilePicture'
        }
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
          select: 'firstName lastName username profilePicture'
        }
      })
      .lean()

    const [posts, shares] = await Promise.all([postsPromise, sharesPromise])

    // Combine and sort by creation time
    const allContent = [
      ...posts.map((post) => ({
        type: 'post',
        data: post,
        createdAt: post.createdAt
      })),
      ...shares.map((share) => ({
        type: 'share',
        data: share,
        createdAt: share.createdAt
      }))
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit + 1)

    const hasMore = allContent.length > limit
    const contentToReturn = hasMore ? allContent.slice(0, limit) : allContent
    const nextCursor =
      hasMore && contentToReturn.length > 0
        ? contentToReturn[contentToReturn.length - 1].createdAt.toISOString()
        : null

    return NextResponse.json({
      posts: convertObjectIdsToStrings(contentToReturn),
      nextCursor
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ posts: [], nextCursor: null }, { status: 500 })
  }
}
