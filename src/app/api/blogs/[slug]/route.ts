import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { safeApiError } from '@/lib/apiError'
import {
  blogR2KeysRemovedSinceUpdate,
  collectBlogR2Keys,
  deleteBlogKeysFromR2,
  isSafeBlogR2Key
} from '@/lib/blogR2Cleanup'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import { createR2S3Client } from '@/lib/r2S3Client'
import Blog, { BLOG_CATEGORIES } from '@/models/Blog'
import BlogComment from '@/models/BlogComment'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

import { MAX_BLOG_CONTENT_BLOCKS, MAX_FILE_SIZE } from '@/data/constants'

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    const { slug } = await params

    const blog = (await Blog.findOne({ slug })
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
      .lean()) as any

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    const authorRef = blog.author as
      | { _id: { toString: () => string } }
      | { toString: () => string }
    const authorId =
      authorRef && typeof authorRef === 'object' && '_id' in authorRef
        ? authorRef._id.toString()
        : String(authorRef)
    const isAuthor =
      !!currentUser?._id && authorId === currentUser._id.toString()

    if (blog.status !== 'published' && !isAuthor) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Increment view count (only for published blogs)
    if (blog.status === 'published') {
      await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } })
    }

    return NextResponse.json(convertObjectIdsToStrings(blog))
  } catch (error: unknown) {
    console.error('Error fetching blog:', error)
    return NextResponse.json(
      { error: safeApiError(error, 'Internal server error') },
      { status: 500 }
    )
  }
}

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const s3Client = createR2S3Client()

  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    const { slug } = await params
    const body = await request.json()

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Find the existing blog
    const existingBlog = (await Blog.findOne({ slug }).lean()) as any
    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Check if user is the author
    if (existingBlog.author.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own blogs' },
        { status: 403 }
      )
    }

    const {
      title,
      summary,
      category,
      tags: rawTags,
      coverImageUrl,
      status = existingBlog.status,
      contentBlocks: rawContentBlocks
    } = body

    const patchContentBlocks = Object.hasOwn(body, 'contentBlocks')
    const patchTags = Object.hasOwn(body, 'tags')

    // Validation
    if (title && title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      )
    }

    if (summary && summary.length > 500) {
      return NextResponse.json(
        { error: 'Summary must be 500 characters or less' },
        { status: 400 }
      )
    }

    if (
      category !== undefined &&
      (typeof category !== 'string' ||
        !(BLOG_CATEGORIES as readonly string[]).includes(category))
    ) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    if (patchContentBlocks) {
      if (!Array.isArray(rawContentBlocks)) {
        return NextResponse.json(
          { error: 'contentBlocks must be an array' },
          { status: 400 }
        )
      }
      if (rawContentBlocks.length > MAX_BLOG_CONTENT_BLOCKS) {
        return NextResponse.json(
          {
            error: `At most ${MAX_BLOG_CONTENT_BLOCKS} content blocks allowed`
          },
          { status: 400 }
        )
      }
      const textLen = rawContentBlocks
        .filter(
          (b: { type?: string }) => b.type === 'text' || b.type === 'code'
        )
        .reduce(
          (acc: number, b: { content?: string }) =>
            acc + (b.content?.length || 0),
          0
        )
      if (textLen > 50000) {
        return NextResponse.json(
          { error: 'Content must be 50,000 characters or less' },
          { status: 400 }
        )
      }
    }

    // Handle cover image upload if it's a new base64 string
    let processedCoverImage = existingBlog.coverImage
    if (coverImageUrl && coverImageUrl.startsWith('data:image/')) {
      try {
        // Delete old image if it exists
        if (isSafeBlogR2Key(existingBlog.coverImage?.key)) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME,
            Key: existingBlog.coverImage.key
          })
          await s3Client.send(deleteCommand)
        }

        // Upload new image
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
        // Continue with existing image rather than failing
      }
    } else if (
      coverImageUrl &&
      coverImageUrl !== existingBlog.coverImage?.url
    ) {
      // External URL changed
      processedCoverImage = { url: coverImageUrl, key: '' }
    }

    // Prepare update data (body lives in contentBlocks, not a top-level content field)
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (summary !== undefined) updateData.summary = summary.trim()
    if (category !== undefined) updateData.category = category
    if (patchTags) {
      updateData.tags = Array.isArray(rawTags)
        ? rawTags.filter((tag: string) => String(tag).trim())
        : []
    }
    if (processedCoverImage !== existingBlog.coverImage)
      updateData.coverImage = processedCoverImage
    if (status !== undefined) updateData.status = status
    if (patchContentBlocks) updateData.contentBlocks = rawContentBlocks

    // Set publishedAt if status changes to published
    if (status === 'published' && existingBlog.status !== 'published') {
      updateData.publishedAt = new Date()
    }

    const nextContentBlocks = patchContentBlocks
      ? rawContentBlocks
      : existingBlog.contentBlocks

    const r2KeysToDrop = blogR2KeysRemovedSinceUpdate(
      {
        coverImage: existingBlog.coverImage,
        contentBlocks: existingBlog.contentBlocks
      },
      {
        coverImage: processedCoverImage,
        contentBlocks: nextContentBlocks
      }
    )

    // Update the blog
    const updatedBlog = await Blog.findOneAndUpdate({ slug }, updateData, {
      new: true
    })
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

    if (!updatedBlog) {
      return NextResponse.json(
        { error: 'Failed to update blog' },
        { status: 500 }
      )
    }

    if (r2KeysToDrop.length > 0) {
      await deleteBlogKeysFromR2(s3Client, r2KeysToDrop)
    }

    return NextResponse.json(convertObjectIdsToStrings(updatedBlog))
  } catch (error: unknown) {
    console.error('Error updating blog:', error)
    return NextResponse.json(
      { error: safeApiError(error, 'Internal server error') },
      { status: 500 }
    )
  }
}

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const s3Client = createR2S3Client()

  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    const { slug } = await params

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Find the blog
    const blog = (await Blog.findOne({ slug }).lean()) as any
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Check if user is the author
    if (blog.author.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own blogs' },
        { status: 403 }
      )
    }

    const r2Keys = collectBlogR2Keys(blog)
    await deleteBlogKeysFromR2(s3Client, r2Keys)

    await BlogComment.deleteMany({ blog: blog._id })

    await Blog.findOneAndDelete({ slug })

    return NextResponse.json({ message: 'Blog deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting blog:', error)
    return NextResponse.json(
      { error: safeApiError(error, 'Internal server error') },
      { status: 500 }
    )
  }
}
