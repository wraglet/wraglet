import { NextRequest, NextResponse } from 'next/server'
import { SearchResponse, SearchResultItem } from '@/interfaces'
import client from '@/lib/db'
import Post from '@/models/Post'
import User from '@/models/User'

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') // Optional filter by type

    if (!query || query.trim().length < 1) {
      return NextResponse.json<SearchResponse>({
        success: true,
        results: [],
        totalCount: 0,
        query: query || ''
      })
    }

    await client()

    const searchResults: SearchResultItem[] = []

    // Search users if no type filter or type is 'user'
    if (!type || type === 'user') {
      const users = await User.find({
        $and: [
          { publicProfileVisible: true },
          {
            $or: [
              { firstName: { $regex: query, $options: 'i' } },
              { lastName: { $regex: query, $options: 'i' } },
              { username: { $regex: query, $options: 'i' } },
              { bio: { $regex: query, $options: 'i' } }
            ]
          }
        ]
      })
        .select('firstName lastName username profilePicture bio')
        .limit(limit / 2)
        .lean()

      users.forEach((user: any) => {
        searchResults.push({
          _id: user._id.toString(),
          type: 'user',
          title: `${user.firstName} ${user.lastName}`,
          subtitle: `${user.username}${user.bio ? ` • ${user.bio.substring(0, 50)}${user.bio.length > 50 ? '...' : ''}` : ''}`,
          avatar: user.profilePicture?.url,
          url: `/${user.username}`,
          relevanceScore: calculateRelevanceScore(query, [
            user.firstName,
            user.lastName,
            user.username,
            user.bio || ''
          ])
        })
      })
    }

    // Search posts if no type filter or type is 'post'
    if (!type || type === 'post') {
      const posts = await Post.find({
        'content.text': { $regex: query, $options: 'i' }
      })
        .populate('author', 'firstName lastName username profilePicture')
        .select('content author createdAt')
        .limit(limit / 2)
        .lean()

      posts.forEach((post: any) => {
        const postText = post.content.text || ''
        searchResults.push({
          _id: post._id.toString(),
          type: 'post',
          title:
            postText.length > 60 ? `${postText.substring(0, 60)}...` : postText,
          subtitle: `by ${post.author.firstName} ${post.author.lastName} (${post.author.username})`,
          avatar: post.author.profilePicture?.url,
          url: `/post/${post._id}`,
          relevanceScore: calculateRelevanceScore(query, [postText])
        })
      })
    }

    // TODO: Add blog and video search when those models are implemented
    // For now, we can add placeholder logic or skip

    // Sort by relevance score
    searchResults.sort(
      (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
    )

    // Limit results
    const limitedResults = searchResults.slice(0, limit)

    return NextResponse.json<SearchResponse>({
      success: true,
      results: limitedResults,
      totalCount: searchResults.length,
      query
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json<SearchResponse>(
      {
        success: false,
        results: [],
        totalCount: 0,
        query: ''
      },
      { status: 500 }
    )
  }
}

// Helper function to calculate relevance score
const calculateRelevanceScore = (query: string, fields: string[]): number => {
  const queryLower = query.toLowerCase()
  let score = 0

  fields.forEach((field) => {
    if (!field) return

    const fieldLower = field.toLowerCase()

    // Exact match gets highest score
    if (fieldLower === queryLower) {
      score += 100
    }
    // Starts with query gets high score
    else if (fieldLower.startsWith(queryLower)) {
      score += 50
    }
    // Contains query gets medium score
    else if (fieldLower.includes(queryLower)) {
      score += 25
    }

    // Bonus for shorter matches (more relevant)
    if (fieldLower.includes(queryLower)) {
      score += Math.max(0, 20 - (field.length - query.length))
    }
  })

  return score
}
