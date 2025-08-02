import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { getAblyInstance } from '@/lib/ably'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import { createNewPostNotification } from '@/lib/notifications'
import Blog from '@/models/Blog'
import Follow from '@/models/Follow'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import slugify from 'slugify'
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
    await initModels()

    const currentUser = await getCurrentUser()
    const body = await request.json()
    const {
      title,
      summary,
      content,
      category,
      tags = [],
      coverImageUrl,
      status = 'draft',
      contentBlocks = []
    } = body

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!summary?.trim()) {
      return NextResponse.json(
        { error: 'Summary is required' },
        { status: 400 }
      )
    }

    if (!contentBlocks || contentBlocks.length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Check if at least one content block has content
    const hasValidContent = contentBlocks.some((block: any) => {
      if (block.type === 'text' || block.type === 'code') {
        return block.content && block.content.trim()
      }
      if (block.type === 'image' || block.type === 'video') {
        return block.metadata?.url
      }
      return false
    })

    if (!hasValidContent) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      )
    }

    if (summary.length > 500) {
      return NextResponse.json(
        { error: 'Summary must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Calculate total content length for validation
    const totalContentLength = contentBlocks
      .filter((block: any) => block.type === 'text' || block.type === 'code')
      .reduce(
        (acc: number, block: any) => acc + (block.content?.length || 0),
        0
      )

    if (totalContentLength > 50000) {
      return NextResponse.json(
        { error: 'Content must be 50,000 characters or less' },
        { status: 400 }
      )
    }

    // Generate a unique slug from the title
    const baseSlug = slugify(title, { lower: true, strict: true })
    let slug = baseSlug
    let suffix = ''
    let exists = await Blog.findOne({ slug })
    while (exists) {
      suffix = '-' + uuidv4().slice(0, 8)
      slug = baseSlug + suffix
      exists = await Blog.findOne({ slug })
    }

    // Handle cover image upload if it's a base64 string
    let processedCoverImage = null
    if (coverImageUrl && coverImageUrl.startsWith('data:image/')) {
      try {
        const base64Data = Buffer.from(
          coverImageUrl.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        )
        const type = coverImageUrl.split(';')[0].split('/')[1]
        const key = `blogs/covers/${uuidv4()}.${type}`
        const bucketName = process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME

        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: base64Data,
          ContentType: `image/${type}`
        })

        await s3Client.send(command)
        const url = `${process.env.NEXT_PUBLIC_R2_USERS_URL}/${key}`
        processedCoverImage = { url, key }
      } catch (error) {
        console.error('Error uploading cover image:', error)
        // Continue without cover image rather than failing
      }
    } else if (coverImageUrl) {
      // External URL
      processedCoverImage = { url: coverImageUrl, key: '' }
    }

    // Create the blog
    const blog = await Blog.create({
      title: title.trim(),
      summary: summary.trim(),
      category,
      tags: Array.isArray(tags) ? tags.filter((tag) => tag.trim()) : [],
      coverImage: processedCoverImage,
      status,
      author: currentUser._id,
      contentBlocks,
      slug
    })

    // Populate the blog for response
    const populatedBlog = await Blog.findById(blog._id)
      .populate({
        path: 'author',
        select: 'firstName lastName username gender pronoun profilePicture'
      })
      .populate({
        path: 'reactions',
        populate: {
          path: 'userId',
          select: 'firstName lastName username profilePicture gender'
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

    if (!populatedBlog) {
      return NextResponse.json(
        { error: 'Failed to create blog' },
        { status: 500 }
      )
    }

    // Convert ObjectIds to strings for JSON serialization
    const convertedBlog = convertObjectIdsToStrings(populatedBlog)

    // Real-time notification if published
    if (status === 'published') {
      try {
        // Get followers
        const followers = await Follow.find({ followingId: currentUser._id })
          .select('followerId')
          .lean()

        const followerIds = followers.map((f) => f.followerId.toString())

        // Create notifications for followers
        if (followerIds.length > 0) {
          await createNewPostNotification(
            currentUser._id.toString(),
            followerIds,
            convertedBlog._id
          )
        }

        // Publish to Ably for real-time updates
        const ably = getAblyInstance()
        const channel = ably.channels.get('feed-updates')
        await channel.publish('new-blog', {
          blog: convertedBlog,
          author: {
            _id: currentUser._id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            username: currentUser.username
          }
        })
      } catch (error) {
        console.error('Error with real-time notifications:', error)
        // Don't fail the request if notifications fail
      }
    }

    return NextResponse.json(convertedBlog, { status: 201 })
  } catch (error: any) {
    console.error('Error creating blog:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = async (request: Request) => {
  try {
    await client()
    await initModels()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const cursor = searchParams.get('cursor')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'published'

    // Build query
    let query: any = {}

    // Handle status filter - 'all' means no status filter, otherwise filter by status
    if (status !== 'all') {
      query.status = status
    }

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) }
    }

    if (category) {
      query.category = category
    }

    if (tag) {
      query.tags = { $in: [tag] }
    }

    if (author) {
      query.author = author
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Get blogs
    const blogs = await Blog.find(query)
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
          select: 'firstName lastName username profilePicture gender'
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

    const hasMore = blogs.length > limit
    const blogsToReturn = hasMore ? blogs.slice(0, limit) : blogs
    const nextCursor =
      hasMore && blogsToReturn.length > 0
        ? blogsToReturn[blogsToReturn.length - 1].createdAt.toISOString()
        : null

    return NextResponse.json({
      blogs: convertObjectIdsToStrings(blogsToReturn),
      nextCursor,
      hasMore
    })
  } catch (error: any) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
