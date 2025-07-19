'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { UserInterface } from '@/interfaces'
import { useFollow } from '@/lib/hooks/useFollow'
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
        <p className="line-clamp-2 text-sm text-gray-900">{post.content}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span>
            {post.author.firstName} {post.author.lastName}
          </span>
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  )
}

// Activity item
const ActivityItem = ({ activity }: { activity: any }) => {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-sky-50">
      <Avatar
        gender={activity.user.gender}
        className="h-8 w-8"
        alt={`${activity.user.firstName}'s Profile`}
        src={activity.user.profilePicture?.url!}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-medium">
            {activity.user.firstName} {activity.user.lastName}
          </span>{' '}
          {activity.action}
        </p>
        <p className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(activity.timestamp), {
            addSuffix: true
          })}
        </p>
      </div>
    </div>
  )
}

// Main RightNav component (simplified - no Ably for now)
const RightNav = ({ otherUsers }: { otherUsers: UserInterface[] }) => {
  const [trendingTopics, setTrendingTopics] = useState<any[]>([])
  const [trendingPosts, setTrendingPosts] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState({
    topics: true,
    trendingPosts: true,
    activities: true
  })

  // Fetch trending topics
  useEffect(() => {
    fetch('/api/users/topics-trending')
      .then((res) => res.json())
      .then((data) => {
        setTrendingTopics(data.topics || [])
        setLoading((prev) => ({ ...prev, topics: false }))
      })
      .catch(() => setLoading((prev) => ({ ...prev, topics: false })))
  }, [])

  // Fetch trending posts
  useEffect(() => {
    fetch('/api/posts?limit=5&feedType=trending')
      .then((res) => res.json())
      .then((data) => {
        setTrendingPosts(data.posts || [])
        setLoading((prev) => ({ ...prev, trendingPosts: false }))
      })
      .catch(() => setLoading((prev) => ({ ...prev, trendingPosts: false })))
  }, [])

  // Fetch recent activities
  useEffect(() => {
    fetch('/api/activities?limit=10')
      .then((res) => res.json())
      .then((data) => {
        setActivities(data.activities || [])
        setLoading((prev) => ({ ...prev, activities: false }))
      })
      .catch(() => setLoading((prev) => ({ ...prev, activities: false })))
  }, [])

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
            {otherUsers.slice(0, 5).map((user) => (
              <UserSuggestion key={`discover-${user._id}`} user={user} />
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
            {loading.topics ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded bg-gray-200"
                  ></div>
                ))}
              </div>
            ) : trendingTopics.length > 0 ? (
              trendingTopics
                .slice(0, 5)
                .map((topic) => (
                  <TrendingTopic
                    key={topic.tag}
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
            {loading.trendingPosts ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-12 w-12 animate-pulse rounded bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : trendingPosts.length > 0 ? (
              trendingPosts
                .slice(0, 3)
                .map((post) => (
                  <TrendingPostPreview key={post._id} post={post} />
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
            {loading.activities ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              activities
                .slice(0, 5)
                .map((activity, index) => (
                  <ActivityItem
                    key={`activity-${activity._id || index}`}
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
