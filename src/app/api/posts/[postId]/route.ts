import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import Post from '@/models/Post'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) => {
  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params

    const post = await Post.findById(postId)
      .populate([
        {
          path: 'author',
          select:
            'firstName lastName username gender pronoun profilePicture coverPhoto'
        },
        {
          path: 'comments',
          populate: {
            path: 'author',
            select: 'firstName lastName username gender pronoun profilePicture'
          }
        },
        {
          path: 'reactions.userId',
          select: 'firstName lastName username profilePicture'
        }
      ])
      .lean()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Convert ObjectIds to strings
    const convertedPost = convertObjectIdsToStrings(post)

    return NextResponse.json(convertedPost)
  } catch (error: any) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch post' },
      { status: 500 }
    )
  }
}
