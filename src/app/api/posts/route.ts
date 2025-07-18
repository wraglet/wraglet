import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import { createNewPostNotification } from '@/lib/notifications'
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

    if (text) {
      content = { ...content, text }
    }

    if (image) {
      const uploadedImage = await uploadImageToR2(image)
      content = { ...content, images: [uploadedImage] }
    }

    const post = await Post.create({
      content,
      audience,
      author: currentUser._id
    })

    // Get user's followers to send notifications
    try {
      const followers = await Follow.find({ followingId: currentUser._id })
        .select('followerId')
        .lean()

      if (followers.length > 0) {
        const followerIds = followers.map((f) => f.followerId.toString())
        await createNewPostNotification(
          currentUser._id.toString(),
          followerIds,
          post._id.toString()
        )
      }
    } catch (error) {
      console.error('Error creating new post notifications:', error)
    }

    return NextResponse.json(convertObjectIdsToStrings(post))
  } catch (error) {
    console.error('Error creating post:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const cursor = searchParams.get('cursor')
  const feedType = searchParams.get('feedType') || 'auto' // 'auto', 'trending', 'following'

  try {
    await client()

    const currentUser = await getCurrentUser()
    if (!currentUser?._id) {
      return NextResponse.json({ posts: [], nextCursor: null }, { status: 401 })
    }

    // Get user's following list for mutual shares
    const userFollowingIds = await Follow.find({ followerId: currentUser._id })
      .select('followingId')
      .lean()
    const followingIds = userFollowingIds.map((f) => f.followingId.toString())

    // If user has no followings or requests trending feed, show trending/public posts
    if (
      feedType === 'trending' ||
      (feedType === 'auto' && followingIds.length === 0)
    ) {
      const tag = searchParams.get('tag')
      // Trending: posts with most reactions/comments/shares in last 48h, fallback to recent public posts
      const trendingWindow = new Date(Date.now() - 1000 * 60 * 60 * 48) // 48 hours
      // Find posts created in the last 48h, sorted by (reactions + comments + shareCount)
      const trendingQuery: any = {
        createdAt: { $gte: trendingWindow },
        audience: 'public'
      }
      if (tag) {
        trendingQuery['content.tags'] = tag
      }
      const trendingPosts = await Post.find(trendingQuery)
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

      // Add a score for trending
      const scoredTrending: any[] = trendingPosts.map((post) => ({
        ...post,
        _trendingScore:
          (post.reactions?.length || 0) +
          (post.comments?.length || 0) +
          (post.shareCount || 0)
      }))
      scoredTrending.sort(
        (a, b) =>
          b._trendingScore - a._trendingScore ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      // Remove _trendingScore before returning
      let postsToReturn: any[] = scoredTrending
        .map(({ _trendingScore, ...rest }) => rest)
        .filter((p) => p.createdAt) // Only keep posts with createdAt
        .slice(0, limit + 1)
      if (postsToReturn.length < limit + 1) {
        const recentPublic: any[] = await Post.find({ audience: 'public' })
          .sort({ createdAt: -1 })
          .limit(limit + 1 - postsToReturn.length)
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
              select:
                'firstName lastName username gender pronoun profilePicture'
            }
          })
          .lean()
        // Map recentPublic to the same structure (in case trending was empty)
        postsToReturn = postsToReturn.concat(
          recentPublic.filter((p) => p.createdAt).map((p) => ({ ...p }))
        )
      }
      const hasMore = postsToReturn.length > limit
      const contentToReturn: any[] = hasMore
        ? postsToReturn.slice(0, limit)
        : postsToReturn
      // Find the last post with a valid createdAt for nextCursor
      let nextCursor = null
      if (hasMore && contentToReturn.length > 0) {
        for (let i = contentToReturn.length - 1; i >= 0; i--) {
          const c = contentToReturn[i]
          if (c.createdAt) {
            nextCursor =
              typeof c.createdAt === 'string'
                ? c.createdAt
                : c.createdAt.toISOString?.() || c.createdAt
            break
          }
        }
      }
      return NextResponse.json({
        posts: convertObjectIdsToStrings(contentToReturn),
        nextCursor
      })
    }

    // Otherwise, show personalized feed (following + mutual shares + public shares)
    // Build query for pagination
    let query: any = {}
    let shareQuery: any = {}
    const cursor = searchParams.get('cursor')
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) }
      shareQuery.createdAt = { $lt: new Date(cursor) }
    }

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
    const contentToReturn: any[] = hasMore
      ? allContent.slice(0, limit)
      : allContent
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
