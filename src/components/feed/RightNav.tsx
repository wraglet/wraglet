'use client'

import { useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { DiscoverUser } from '@/interfaces'
import { useFollow } from '@/lib/hooks/useFollow'
import {
  profileHrefFromUsername,
  usernameToDisplayHandle
} from '@/lib/profileHref'
import { getFollowButtonLabel } from '@/utils/displayFormat'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { FaHashtag } from 'react-icons/fa'

import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

// User suggestion card with real-time follow state
const UserSuggestion = ({ user }: { user: DiscoverUser }) => {
  const { isFollowing, follow, unfollow, loading } = useFollow(user._id)

  const handleFollow = () => {
    if (isFollowing) {
      unfollow()
    } else {
      follow()
    }
  }

  const profileHref =
    profileHrefFromUsername(user.username) ?? `/${user.username}`

  return (
    <div className="flex items-center gap-2">
      <Link
        href={profileHref}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-0.5 py-0.5 transition-colors outline-none hover:bg-sky-50/70 focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/30"
      >
        <div className="relative shrink-0">
          <Avatar
            src={user.profilePicture?.url || null}
            alt={user.username}
            size="h-9 w-9"
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
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0EA5E9]">
              <span className="text-xs text-white">🆕</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0">
            <p className="truncate text-xs font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            {/* Show badge text for trending users */}
            {user.isTrending && (
              <span className="shrink-0 rounded bg-orange-100 px-1 text-[10px] leading-none font-medium text-orange-600">
                Trending
              </span>
            )}
          </div>
          <p className="truncate text-[11px] leading-tight text-gray-500">
            {usernameToDisplayHandle(user.username)}
          </p>
        </div>
      </Link>
      <Button
        type="button"
        className={`h-7 shrink-0 rounded-full px-2.5 py-0 text-[11px] font-medium transition-colors ${
          isFollowing
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-sky-100 text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white'
        } disabled:opacity-50`}
        onClick={handleFollow}
        disabled={loading}
      >
        {getFollowButtonLabel(isFollowing, loading)}
      </Button>
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
    <Button
      type="button"
      onClick={() => onClick(topic.tag)}
      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-sky-50/80"
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <FaHashtag className="h-3.5 w-3.5 shrink-0 text-[#0EA5E9]" />
        <span className="truncate text-xs font-semibold text-gray-900">
          #{topic.tag}
        </span>
      </div>
      <span className="shrink-0 pl-1 text-[11px] text-gray-500">
        {topic.count} posts
      </span>
    </Button>
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
    if (typeof post.content === 'object' && post.content?.text) {
      return post.content.text
    }

    // If content is an object but no text property, return a fallback
    if (typeof post.content === 'object') {
      return 'Rich content post'
    }

    // Fallback for any other type
    return String(post.content)
  }

  const authorHref = profileHrefFromUsername(post.author?.username)
  const authorLabel =
    `${post.author?.firstName || 'Unknown'} ${post.author?.lastName || ''}`.trim()

  return (
    <div className="flex items-start gap-2 rounded-md px-1.5 py-1.5 transition-colors hover:bg-sky-50/70">
      {post.images?.[0] && (
        <Link href={`/post/${post._id}`} className="shrink-0 rounded">
          <Image
            src={post.images[0].url}
            alt="Post preview"
            width={40}
            height={40}
            className="size-10 rounded object-cover"
          />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <Link
          href={`/post/${post._id}`}
          className="block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/30"
        >
          <p className="line-clamp-2 text-xs leading-snug text-gray-900">
            {getPostContent(post)}
          </p>
        </Link>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0 text-[11px] text-gray-500">
          {authorHref ? (
            <Link
              href={authorHref}
              className="text-gray-500 hover:text-[#0EA5E9] focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/30 focus-visible:outline-none"
            >
              {authorLabel}
            </Link>
          ) : (
            <span>{authorLabel}</span>
          )}
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
    </div>
  )
}

// Activity item
const ActivityItem = ({ activity }: { activity: any }) => {
  // Ensure we have valid activity data
  if (!activity?.user) {
    return null
  }

  const actorHref = profileHrefFromUsername(activity.user.username)
  const displayName =
    `${activity.user.firstName || 'Unknown'} ${activity.user.lastName || ''}`.trim()

  return (
    <div className="flex items-start gap-2 rounded-md px-1.5 py-1.5 transition-colors hover:bg-sky-50/70">
      {actorHref ? (
        <Link
          href={actorHref}
          className="mt-0.5 shrink-0 rounded-full ring-offset-1 outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/40"
        >
          <Avatar
            gender={activity.user.gender}
            size="h-7 w-7"
            alt={`${activity.user.firstName || 'User'}'s Profile`}
            src={activity.user.profilePicture?.url || null}
          />
        </Link>
      ) : (
        <Avatar
          gender={activity.user.gender}
          size="h-7 w-7"
          className="mt-0.5 shrink-0"
          alt={`${activity.user.firstName || 'User'}'s Profile`}
          src={activity.user.profilePicture?.url || null}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-snug text-gray-900">
          {actorHref ? (
            <Link
              href={actorHref}
              className="font-semibold text-gray-900 hover:text-[#0EA5E9] focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/30 focus-visible:outline-none"
            >
              {displayName}
            </Link>
          ) : (
            <span className="font-semibold">{displayName}</span>
          )}{' '}
          <span className="font-normal text-gray-700">
            {activity.action || 'did something'}
          </span>
        </p>
        <p className="mt-0.5 text-[11px] text-gray-500">
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
const RightNav = ({ otherUsers }: { otherUsers: DiscoverUser[] }) => {
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
    globalThis.location.href = `/?topic=${encodeURIComponent(tag)}`
  }, [])

  const renderTrendingTopics = () => {
    if (topicsLoading) {
      return (
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={`topic-loading-${i}`}
              className="h-8 animate-pulse rounded-md bg-gray-100"
            />
          ))}
        </div>
      )
    }

    if (!(trendingTopics || []).length) {
      return (
        <p className="py-2 text-center text-xs text-gray-500">
          No trending topics
        </p>
      )
    }

    return (trendingTopics || [])
      .slice(0, 5)
      .map((topic: { tag: string; count: number }, index: number) => (
        <TrendingTopic
          key={`rightnav-topic-${topic.tag}-${index}`}
          topic={topic}
          onClick={handleTopicClick}
        />
      ))
  }

  const renderTrendingPosts = () => {
    if (trendingPostsLoading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={`trending-loading-${i}`} className="flex gap-2">
              <div className="size-10 shrink-0 animate-pulse rounded bg-gray-100" />
              <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
                <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (!(trendingPosts || []).length) {
      return (
        <p className="py-2 text-center text-xs text-gray-500">
          No trending posts
        </p>
      )
    }

    return (trendingPosts || [])
      .slice(0, 3)
      .map((post: { _id: string }) => (
        <TrendingPostPreview
          key={`rightnav-trending-${post._id}`}
          post={post}
        />
      ))
  }

  const renderActivities = () => {
    if (activitiesLoading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={`activity-loading-${i}`} className="flex gap-2">
              <div className="size-7 shrink-0 animate-pulse rounded-full bg-gray-100" />
              <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
                <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-2.5 w-16 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (!(activities || []).length) {
      return (
        <p className="py-2 text-center text-xs text-gray-500">
          No recent activity
        </p>
      )
    }

    return (activities || [])
      .slice(0, 5)
      .map((activity: { _id?: string; id?: string }, index: number) => (
        <ActivityItem
          key={`rightnav-activity-${activity._id || activity.id || index}`}
          activity={activity}
        />
      ))
  }

  return (
    <aside className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hidden h-full w-[260px] flex-shrink-0 overflow-y-auto lg:block xl:w-[288px]">
      <div className="flex h-full flex-col gap-2 py-2 pr-0.5">
        {/* Discover People - Single, improved section */}
        <div className="rounded-lg border border-solid border-neutral-200 bg-white p-3 drop-shadow-sm">
          <h2 className="mb-2 text-xs font-bold text-gray-900">
            Discover People
          </h2>
          <div className="flex flex-col gap-2">
            {otherUsers.slice(0, 5).map((user, index) => (
              <UserSuggestion
                key={`rightnav-discover-${user._id}-${index}`}
                user={user}
              />
            ))}
            {otherUsers.length === 0 && (
              <p className="py-2 text-center text-xs text-gray-500">
                No new people to discover right now
              </p>
            )}
            {otherUsers.length > 5 && (
              <Button
                type="button"
                className="h-auto justify-center py-1 text-xs font-medium text-[#0EA5E9] hover:text-sky-700"
              >
                See more people
              </Button>
            )}
          </div>
        </div>

        {/* Trending Topics */}
        <div className="rounded-lg border border-solid border-neutral-200 bg-white p-3 drop-shadow-sm">
          <h2 className="mb-2 text-xs font-bold text-gray-900">
            Trending Topics
          </h2>
          <div className="flex flex-col gap-0.5">{renderTrendingTopics()}</div>
        </div>

        {/* Trending Posts Preview */}
        <div className="rounded-lg border border-solid border-neutral-200 bg-white p-3 drop-shadow-sm">
          <h2 className="mb-2 text-xs font-bold text-gray-900">
            Trending Posts
          </h2>
          <div className="flex flex-col gap-0.5">{renderTrendingPosts()}</div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-lg border border-solid border-neutral-200 bg-white p-3 drop-shadow-sm">
          <h2 className="mb-2 text-xs font-bold text-gray-900">
            Recent Activity
          </h2>
          <div className="flex flex-col gap-0.5">{renderActivities()}</div>
        </div>
      </div>
    </aside>
  )
}

export default RightNav
