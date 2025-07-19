'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { UserInterface } from '@/interfaces'
import { useFollow } from '@/lib/hooks/useFollow'

import Avatar from '@/components/shared/Avatar'

// User suggestion card (static version)
const UserSuggestion = ({
  user,
  onFollowChange
}: {
  user: UserInterface
  onFollowChange?: (userId: string, isFollowing: boolean) => void
}) => {
  const {
    isFollowing,
    follow,
    loading,
    followersCount,
    followingCount,
    isInitialLoading
  } = useFollow(user._id)

  const handleFollow = useCallback(async () => {
    try {
      await follow()
      onFollowChange?.(user._id, !isFollowing)
    } catch (error) {
      console.error('Failed to follow user:', error)
    }
  }, [follow, isFollowing, onFollowChange, user._id])

  return (
    <div className="group relative flex items-center justify-between rounded-lg transition-all duration-200 hover:bg-sky-50/50">
      <div className="flex items-center gap-3">
        <div className="block overflow-hidden rounded-full transition-transform duration-200 hover:scale-105">
          <Avatar
            src={user.profilePicture?.url || null}
            alt={`${user.firstName}'s Profile`}
            size="h-11 w-11"
            gender={user.gender}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-900">
            {user.firstName} {user.lastName}
          </span>
          {isInitialLoading ? (
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
          ) : (
            <p className="text-xs font-medium text-gray-500">
              {followersCount} followers · {followingCount} following
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isInitialLoading ? (
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
        ) : (
          <button
            className="flex w-fit items-center gap-1 rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-600 transition-all duration-200 hover:bg-sky-500 hover:text-white disabled:opacity-60"
            onClick={handleFollow}
            disabled={loading}
          >
            {isFollowing ? 'Following' : loading ? 'Following...' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  )
}

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
        <span className="text-sm font-medium text-gray-900">#{topic.tag}</span>
      </div>
      <span className="text-xs text-gray-500">{topic.count} posts</span>
    </button>
  )
}

const TrendingPostPreview = ({ post }: { post: any }) => {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-sky-50">
      {post.images?.[0] && (
        <Image
          src={post.images[0].url}
          alt="Post preview"
          width={48}
          height={48}
          className="h-12 w-12 rounded object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm text-gray-900">{post.content}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span>
            {post.author.firstName} {post.author.lastName}
          </span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

const ActivityItem = ({ activity }: { activity: any }) => {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-sky-50">
      <Avatar
        src={activity.user.profilePicture?.url || null}
        alt={`${activity.user.firstName}'s Profile`}
        size="h-8 w-8"
        gender={activity.user.gender}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-medium">
            {activity.user.firstName} {activity.user.lastName}
          </span>{' '}
          {activity.action}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(activity.timestamp).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

// Static content component (no real-time features)
const RightNavNoAbly = ({
  otherUsers,
  currentUserId
}: {
  otherUsers: UserInterface[]
  currentUserId: string
}) => {
  const [trendingTopics, setTrendingTopics] = useState<any[]>([])
  const [whoToFollow, setWhoToFollow] = useState<UserInterface[]>([])
  const [trendingPosts, setTrendingPosts] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState({
    topics: true,
    whoToFollow: true,
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

  // Fetch who to follow
  useEffect(() => {
    fetch('/api/users/people-you-may-know')
      .then((res) => res.json())
      .then((data) => {
        setWhoToFollow(data.users || [])
        setLoading((prev) => ({ ...prev, whoToFollow: false }))
      })
      .catch(() => setLoading((prev) => ({ ...prev, whoToFollow: false })))
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

  // Fetch recent activities (mock data for now)
  useEffect(() => {
    // Mock activities since we don't have an activities API yet
    const mockActivities = [
      {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          gender: 'male',
          profilePicture: { url: null }
        },
        action: 'posted a new update',
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        user: {
          firstName: 'Jane',
          lastName: 'Smith',
          gender: 'female',
          profilePicture: { url: null }
        },
        action: 'started following you',
        timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      }
    ]
    setActivities(mockActivities)
    setLoading((prev) => ({ ...prev, activities: false }))
  }, [])

  const handleTopicClick = useCallback((tag: string) => {
    // Navigate to filtered feed
    window.location.href = `/?topic=${encodeURIComponent(tag)}`
  }, [])

  return (
    <aside className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[280px] flex-shrink-0 overflow-y-auto lg:block xl:w-[320px]">
      <div className="flex h-full flex-col gap-4 py-4">
        {/* Discover People - Static */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Discover People
          </h2>
          <div className="flex flex-col gap-4">
            {otherUsers.slice(0, 5).map((user) => (
              <UserSuggestion key={`noably-discover-${user._id}`} user={user} />
            ))}
            {otherUsers.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">
                No new people to discover right now
              </p>
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

        {/* Who to Follow */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Who to Follow
          </h2>
          <div className="flex flex-col gap-4">
            {loading.whoToFollow ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-32 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : whoToFollow.length > 0 ? (
              whoToFollow
                .slice(0, 3)
                .map((user) => (
                  <UserSuggestion
                    key={`noably-follow-${user._id}`}
                    user={user}
                  />
                ))
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                No suggestions available
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
                  <ActivityItem key={index} activity={activity} />
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

export default RightNavNoAbly
