import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Blog from '@/models/Blog'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    await client()
    await initModels()

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

    // Increment view count (only for published blogs)
    if (blog.status === 'published') {
      await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } })
    }

    return NextResponse.json(convertObjectIdsToStrings(blog))
  } catch (error: any) {
    console.error('Error fetching blog:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
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
      content,
      category,
      tags = [],
      coverImageUrl,
      status = existingBlog.status,
      contentBlocks = []
    } = body

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

    if (content && content.length > 50000) {
      return NextResponse.json(
        { error: 'Content must be 50,000 characters or less' },
        { status: 400 }
      )
    }

    // Handle cover image upload if it's a new base64 string
    let processedCoverImage = existingBlog.coverImage
    if (coverImageUrl && coverImageUrl.startsWith('data:image/')) {
      try {
        // Delete old image if it exists
        if (existingBlog.coverImage?.key) {
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

    // Prepare update data
    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (summary !== undefined) updateData.summary = summary.trim()
    if (content !== undefined) updateData.content = content.trim()
    if (category !== undefined) updateData.category = category
    if (tags !== undefined)
      updateData.tags = Array.isArray(tags)
        ? tags.filter((tag) => tag.trim())
        : []
    if (processedCoverImage !== existingBlog.coverImage)
      updateData.coverImage = processedCoverImage
    if (status !== undefined) updateData.status = status
    if (contentBlocks !== undefined) updateData.contentBlocks = contentBlocks

    // Set publishedAt if status changes to published
    if (status === 'published' && existingBlog.status !== 'published') {
      updateData.publishedAt = new Date()
    }

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

    return NextResponse.json(convertObjectIdsToStrings(updatedBlog))
  } catch (error: any) {
    console.error('Error updating blog:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
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

    // Delete cover image from R2 if it exists
    if (blog.coverImage?.key) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME,
          Key: blog.coverImage.key
        })
        await s3Client.send(deleteCommand)
      } catch (error) {
        console.error('Error deleting cover image:', error)
        // Continue with blog deletion even if image deletion fails
      }
    }

    // Delete the blog
    await Blog.findOneAndDelete({ slug })

    return NextResponse.json({ message: 'Blog deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting blog:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
