import { NextResponse } from 'next/server'
import client from '@/lib/db'
import Post from '@/models/Post'

export const GET = async (req: Request) => {
  try {
    await client()
    // Find most common tags in posts from last 7 days
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
    // If you use a different field for tags, adjust accordingly
    const result = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          'content.tags': { $exists: true, $ne: [] }
        }
      },
      { $unwind: '$content.tags' },
      { $group: { _id: '$content.tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
    const topics = result.map((t) => ({ tag: t._id, count: t.count }))
    return NextResponse.json({ success: true, topics })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending topics' },
      { status: 500 }
    )
  }
}
