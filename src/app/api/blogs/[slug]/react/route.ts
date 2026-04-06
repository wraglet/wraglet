import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import { safeApiError } from '@/lib/apiError'
import client from '@/lib/db'
import { migrateLegacyBlogLikesToReactions } from '@/lib/migrateBlogLikesToReactions'
import { initModels } from '@/lib/models'
import { createBlogReactionNotification } from '@/lib/notifications'
import Blog from '@/models/Blog'
import PostReaction from '@/models/PostReaction'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
import type { Types } from 'mongoose'

const REACTION_TYPES = new Set(['like', 'love', 'haha', 'wow', 'sad', 'angry'])

const fetchPublishedBlogDoc = async (slug: string) => {
  return Blog.findOne({ slug, status: 'published' })
    .select('_id author slug')
    .lean() as Promise<{
    _id: Types.ObjectId
    author: Types.ObjectId
    slug: string
  } | null>
}

const fetchBlogWithRelations = async (blogId: string) => {
  return Blog.findById(blogId)
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
}

const syncBlogReactionDenorm = async (blogId: Types.ObjectId) => {
  const n = await PostReaction.countDocuments({ blogId })
  await Blog.findByIdAndUpdate(blogId, { $set: { likes: n } })
}

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: number }).code === 11000

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    const { slug } = await params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const type =
      body &&
      typeof body === 'object' &&
      'type' in body &&
      typeof (body as { type: unknown }).type === 'string'
        ? (body as { type: string }).type
        : undefined

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!type || !REACTION_TYPES.has(type)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      )
    }

    const blogMeta = await fetchPublishedBlogDoc(slug)
    if (!blogMeta) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    const blogId = blogMeta._id
    await migrateLegacyBlogLikesToReactions(blogId)

    const existingReaction = await PostReaction.findOne({
      blogId,
      userId: currentUser._id
    })

    let isNewReaction = false

    if (existingReaction) {
      await PostReaction.findByIdAndUpdate(existingReaction._id, {
        type,
        updatedAt: new Date()
      })
    } else {
      try {
        const reaction = await PostReaction.create({
          blogId,
          type,
          userId: currentUser._id
        })
        isNewReaction = true
        await Blog.findByIdAndUpdate(blogId, {
          $push: { reactions: reaction._id }
        })
      } catch (createError: unknown) {
        if (!isDuplicateKeyError(createError)) {
          throw createError
        }
        const raced = await PostReaction.findOne({
          blogId,
          userId: currentUser._id
        })
        if (!raced) {
          throw createError
        }
        await PostReaction.findByIdAndUpdate(raced._id, {
          type,
          updatedAt: new Date()
        })
        isNewReaction = false
      }
    }

    await syncBlogReactionDenorm(blogId)

    if (isNewReaction) {
      try {
        await createBlogReactionNotification(
          currentUser._id.toString(),
          blogMeta.author.toString(),
          blogId.toString(),
          blogMeta.slug,
          type
        )
      } catch (error) {
        console.error('Error creating blog reaction notification:', error)
      }
    }

    const updated = await fetchBlogWithRelations(blogId.toString())
    if (!updated) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    return NextResponse.json(convertObjectIdsToStrings(updated))
  } catch (error: unknown) {
    console.error('Error patching blog reaction:', error)
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
  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    const { slug } = await params

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const blogMeta = await fetchPublishedBlogDoc(slug)
    if (!blogMeta) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    const blogId = blogMeta._id
    await migrateLegacyBlogLikesToReactions(blogId)

    const deleted = await PostReaction.findOneAndDelete({
      blogId,
      userId: currentUser._id
    })

    if (!deleted) {
      return NextResponse.json({ error: 'Reaction not found' }, { status: 404 })
    }

    await Blog.findByIdAndUpdate(blogId, {
      $pull: { reactions: deleted._id }
    })
    await syncBlogReactionDenorm(blogId)

    const updated = await fetchBlogWithRelations(blogId.toString())
    if (!updated) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    return NextResponse.json(convertObjectIdsToStrings(updated))
  } catch (error: unknown) {
    console.error('Error deleting blog reaction:', error)
    return NextResponse.json(
      { error: safeApiError(error, 'Internal server error') },
      { status: 500 }
    )
  }
}
