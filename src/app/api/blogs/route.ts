import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { safeApiError } from '@/lib/apiError'
import { getAblyInstance } from '@/lib/ably'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import { createR2S3Client } from '@/lib/r2S3Client'
import { escapeRegExp } from '@/lib/escapeRegExp'
import { createNewBlogNotification } from '@/lib/notifications'
import Blog, {
  BLOG_CATEGORIES,
  type BlogCategory,
  type IBlogDocument
} from '@/models/Blog'
import Follow from '@/models/Follow'
import {
  MAX_BLOG_CONTENT_BLOCKS,
  MAX_FILE_SIZE
} from '@/data/constants'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import type { FilterQuery } from 'mongoose'
import { isValidObjectId } from 'mongoose'
import slugify from 'slugify'
import { v4 as uuidv4 } from 'uuid'

export const POST = async (request: Request) => {
  const s3Client = createR2S3Client()

  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    const body = await request.json()
    const {
      title,
      summary,
      category,
      tags = [],
      coverImageUrl,
      status = 'draft',
      contentBlocks = []
    } = body

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!summary?.trim()) {
      return NextResponse.json(
        { error: 'Summary is required' },
        { status: 400 }
      )
    }

    if (
      typeof category !== 'string' ||
      !(BLOG_CATEGORIES as readonly string[]).includes(category)
    ) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    if (!contentBlocks || contentBlocks.length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (contentBlocks.length > MAX_BLOG_CONTENT_BLOCKS) {
      return NextResponse.json(
        {
          error: `At most ${MAX_BLOG_CONTENT_BLOCKS} content blocks allowed`
        },
        { status: 400 }
      )
    }

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

    const baseSlug = slugify(title, { lower: true, strict: true })
    let slug = baseSlug
    let exists = await Blog.findOne({ slug })
    while (exists) {
      slug = `${baseSlug}-${uuidv4().slice(0, 8)}`
      exists = await Blog.findOne({ slug })
    }

    let processedCoverImage = null
    if (coverImageUrl && coverImageUrl.startsWith('data:image/')) {
      try {
        const base64Data = Buffer.from(
          coverImageUrl.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        )
        if (base64Data.length > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: 'Cover image exceeds maximum file size' },
            { status: 400 }
          )
        }
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
      }
    } else if (coverImageUrl) {
      processedCoverImage = { url: coverImageUrl, key: '' }
    }

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

    const convertedBlog = convertObjectIdsToStrings(populatedBlog)

    if (status === 'published') {
      try {
        const followers = await Follow.find({ followingId: currentUser._id })
          .select('followerId')
          .lean()

        const followerIds = followers.map((f) => f.followerId.toString())

        if (followerIds.length > 0) {
          await createNewBlogNotification(
            currentUser._id.toString(),
            followerIds,
            convertedBlog._id,
            slug
          )
        }

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
      }
    }

    return NextResponse.json(convertedBlog, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating blog:', error)
    return NextResponse.json(
      { error: safeApiError(error, 'Internal server error') },
      { status: 500 }
    )
  }
}

export const GET = async (request: Request) => {
  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    const me = currentUser?._id?.toString()

    const { searchParams } = new URL(request.url)
    const rawLimit = parseInt(searchParams.get('limit') || '10', 10)
    const limit = Math.min(
      Math.max(Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 10, 1),
      50
    )
    const cursor = searchParams.get('cursor')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const authorFilter = searchParams.get('author')
    const search = searchParams.get('search')
    const statusParam = (searchParams.get('status') || 'published').toLowerCase()

    const query: FilterQuery<IBlogDocument> = {}

    if (authorFilter && !isValidObjectId(authorFilter)) {
      return NextResponse.json({ error: 'Invalid author id' }, { status: 400 })
    }

    if (!me) {
      query.status = 'published'
      if (authorFilter) query.author = authorFilter
    } else if (statusParam === 'published') {
      query.status = 'published'
      if (authorFilter) query.author = authorFilter
    } else if (statusParam === 'draft' || statusParam === 'archived') {
      query.status = statusParam
      query.author = me
      if (authorFilter && authorFilter !== me) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (statusParam === 'all') {
      if (!authorFilter || authorFilter === me) {
        query.author = me
      } else {
        query.status = 'published'
        query.author = authorFilter
      }
    } else {
      query.status = 'published'
      if (authorFilter) query.author = authorFilter
    }

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) }
    }

    if (category) {
      if (!(BLOG_CATEGORIES as readonly string[]).includes(category)) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }
      query.category = category as BlogCategory
    }

    if (tag) {
      query.tags = { $in: [tag] }
    }

    if (search?.trim()) {
      const safe = escapeRegExp(search.trim())
      query.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { summary: { $regex: safe, $options: 'i' } },
        { tags: { $regex: safe, $options: 'i' } },
        {
          contentBlocks: {
            $elemMatch: {
              type: { $in: ['text', 'code'] },
              content: { $regex: safe, $options: 'i' }
            }
          }
        }
      ]
    }

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
  } catch (error: unknown) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json(
      { error: safeApiError(error, 'Internal server error') },
      { status: 500 }
    )
  }
}
