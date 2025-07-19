'use client'

import { useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { UserInterface } from '@/interfaces'
import { useFollow } from '@/lib/hooks/useFollow'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { FaHashtag } from 'react-icons/fa'

import Avatar from '@/components/shared/Avatar'

// User suggestion card with real-time follow state
const UserSuggestion = ({
  user,
  onFollowChange
}: {
  user: UserInterface & {
    isTrending?: boolean
    isRecentActive?: boolean
    isNew?: boolean
  }
  onFollowChange?: (userId: string, isFollowing: boolean) => void
}) => {
  const { isFollowing, follow, loading } = useFollow(user._id)

  const handleFollow = async () => {
    const result = await follow(undefined)
    if (onFollowChange && result !== undefined) {
      onFollowChange(user._id, result)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar
          src={user.profilePicture?.url || null}
          alt={user.username}
          size="h-11 w-11"
          gender={user.gender}
        />
        {/* Badge for trending users */}
        {user.isTrending && (
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500">
            <span className="text-xs text-white">🔥</span>
          </div>
        )}
        {/* Badge for recent active users */}
        {user.isRecentActive && !user.isTrending && (
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
            <span className="text-xs text-white">⚡</span>
          </div>
        )}
        {/* Badge for new users */}
        {user.isNew && !user.isTrending && !user.isRecentActive && (
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
            <span className="text-xs text-white">🆕</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {user.firstName} {user.lastName}
          </p>
          {/* Show badge text for trending users */}
          {user.isTrending && (
            <span className="rounded bg-orange-100 px-1 text-xs text-orange-600">
              Trending
            </span>
          )}
        </div>
        <p className="truncate text-xs text-gray-500">{user.username}</p>
      </div>
      <button
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          isFollowing
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } disabled:opacity-50`}
        onClick={handleFollow}
        disabled={loading}
      >
        {isFollowing ? 'Following' : loading ? 'Following...' : 'Follow'}
      </button>
    </div>
  )
}

// Trending topic card
const TrendingTopic = ({
  topic,
  onClick
}: {
  topic: { tag: string; count: number }
  onClick: (tag: string) => void
}) => {
  return (
    <button
      onClick={() => onClick(topic.tag)}
      className="flex w-full items-center justify-between rounded-lg p-3 transition-all duration-200 hover:bg-sky-50"
    >
      <div className="flex items-center gap-2">
        <FaHashtag className="h-4 w-4 text-sky-500" />
        <span className="text-sm font-medium text-gray-900">#{topic.tag}</span>
      </div>
      <span className="text-xs text-gray-500">{topic.count} posts</span>
    </button>
  )
}

// Trending post preview
const TrendingPostPreview = ({ post }: { post: any }) => {
  // Safely get the content as a string
  const getPostContent = (post: any): string => {
    if (!post.content) return 'No content'

    // If content is a string, return it
    if (typeof post.content === 'string') {
      return post.content
    }

    // If content is an object with text property, return the text
    if (typeof post.content === 'object' && post.content.text) {
      return post.content.text
    }

    // If content is an object but no text property, return a fallback
    if (typeof post.content === 'object') {
      return 'Rich content post'
    }

    // Fallback for any other type
    return String(post.content)
  }

  return (
    <Link
      href={`/post/${post._id}`}
      className="flex items-start gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-sky-50"
    >
      {post.images?.[0] && (
        <Image
          src={post.images[0].url}
          alt="Post preview"
          width={48}
          height={48}
          className="rounded object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm text-gray-900">
          {getPostContent(post)}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span>
            {post.author?.firstName || 'Unknown'} {post.author?.lastName || ''}
          </span>
          <span>•</span>
          <span>
            {post.createdAt
              ? formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true
                })
              : 'Recently'}
          </span>
        </div>
      </div>
    </Link>
  )
}

// Activity item
const ActivityItem = ({ activity }: { activity: any }) => {
  // Ensure we have valid activity data
  if (!activity || !activity.user) {
    return null
  }

  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-sky-50">
      <Avatar
        gender={activity.user.gender}
        className="h-8 w-8"
        alt={`${activity.user.firstName || 'User'}'s Profile`}
        src={activity.user.profilePicture?.url || null}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-medium">
            {activity.user.firstName || 'Unknown'}{' '}
            {activity.user.lastName || ''}
          </span>{' '}
          {activity.action || 'did something'}
        </p>
        <p className="text-xs text-gray-500">
          {activity.timestamp
            ? formatDistanceToNow(new Date(activity.timestamp), {
                addSuffix: true
              })
            : 'Recently'}
        </p>
      </div>
    </div>
  )
}

// Main RightNav component (simplified - no Ably for now)
const RightNav = ({ otherUsers }: { otherUsers: UserInterface[] }) => {
  const { data: trendingTopics, isLoading: topicsLoading } = useQuery({
    queryKey: ['trendingTopics'],
    queryFn: async () => {
      const res = await fetch('/api/users/topics-trending')
      const data = await res.json()
      return data.topics || []
    }
  })

  const { data: trendingPosts, isLoading: trendingPostsLoading } = useQuery({
    queryKey: ['trendingPosts'],
    queryFn: async () => {
      const res = await fetch('/api/posts?limit=5&feedType=trending')
      const data = await res.json()
      const posts = data.posts || []

      // Deduplicate posts by _id to prevent duplicates from API
      const seen = new Set()
      const uniquePosts = posts.filter((post: any) => {
        const id = post._id || post.data?._id
        if (!id || seen.has(id)) return false
        seen.add(id)
        return true
      })

      return uniquePosts
    }
  })

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await fetch('/api/activities?limit=10')
      const data = await res.json()
      return data.activities || []
    }
  })

  const handleTopicClick = useCallback((tag: string) => {
    window.location.href = `/?topic=${encodeURIComponent(tag)}`
  }, [])

  // Debug: Check for duplicates in otherUsers
  useEffect(() => {
    if (otherUsers && otherUsers.length > 0) {
      const userIds = otherUsers.map((user) => user._id)
      const uniqueIds = new Set(userIds)
      if (userIds.length !== uniqueIds.size) {
        console.warn(
          'Duplicate users found in otherUsers:',
          userIds.filter((id, index) => userIds.indexOf(id) !== index)
        )
        console.warn('otherUsers:', otherUsers)
      }
    }
  }, [otherUsers])

  return (
    <aside className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[280px] flex-shrink-0 overflow-y-auto lg:block xl:w-[320px]">
      <div className="flex h-full flex-col gap-4 py-4">
        {/* Discover People - Single, improved section */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Discover People
          </h2>
          <div className="flex flex-col gap-4">
            {otherUsers.slice(0, 5).map((user, index) => (
              <UserSuggestion
                key={`rightnav-discover-${user._id}-${index}`}
                user={user}
              />
            ))}
            {otherUsers.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">
                No new people to discover right now
              </p>
            )}
            {otherUsers.length > 5 && (
              <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                See more people
              </button>
            )}
          </div>
        </div>

        {/* Trending Topics */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Trending Topics
          </h2>
          <div className="flex flex-col gap-2">
            {topicsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={`topic-loading-${i}`}
                    className="h-10 animate-pulse rounded bg-gray-200"
                  ></div>
                ))}
              </div>
            ) : trendingTopics.length > 0 ? (
              (trendingTopics || [])
                .slice(0, 5)
                .map((topic: any, index: number) => (
                  <TrendingTopic
                    key={`rightnav-topic-${topic.tag}-${index}`}
                    topic={topic}
                    onClick={handleTopicClick}
                  />
                ))
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                No trending topics
              </p>
            )}
          </div>
        </div>

        {/* Trending Posts Preview */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Trending Posts
          </h2>
          <div className="flex flex-col gap-3">
            {trendingPostsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={`trending-loading-${i}`} className="flex gap-3">
                    <div className="h-12 w-12 animate-pulse rounded bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : trendingPosts.length > 0 ? (
              (trendingPosts || [])
                .slice(0, 3)
                .map((post: any) => (
                  <TrendingPostPreview
                    key={`rightnav-trending-${post._id}`}
                    post={post}
                  />
                ))
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                No trending posts
              </p>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Recent Activity
          </h2>
          <div className="flex flex-col gap-3">
            {activitiesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={`activity-loading-${i}`} className="flex gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              (activities || [])
                .slice(0, 5)
                .map((activity: any, index: number) => (
                  <ActivityItem
                    key={`rightnav-activity-${activity._id || activity.id || index}`}
                    activity={activity}
                  />
                ))
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default RightNav
