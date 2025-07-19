'use client'

import { useCallback, useState } from 'react'
import { UserInterface } from '@/interfaces'
import { useQuery } from '@tanstack/react-query'
import { ChannelProvider, useChannel } from 'ably/react'

import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

// Real-time content component
const RightNavContent = ({
  otherUsers,
  currentUserId
}: {
  otherUsers: UserInterface[]
  currentUserId: string
}) => {
  const [discoverUsers, setDiscoverUsers] =
    useState<UserInterface[]>(otherUsers)

  const { data: trendingTopics, isLoading: topicsLoading } = useQuery({
    queryKey: ['trendingTopics'],
    queryFn: async () => {
      const res = await fetch('/api/users/topics-trending')
      const data = await res.json()
      return data.topics || []
    }
  })

  const { data: whoToFollow, isLoading: whoToFollowLoading } = useQuery({
    queryKey: ['whoToFollow'],
    queryFn: async () => {
      const res = await fetch('/api/users/people-you-may-know')
      const data = await res.json()
      return data.users || []
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

  // Real-time channel for user interactions
  const { channel } = useChannel('user-interactions', (message) => {
    if (message.name === 'follow-change') {
      const { userId, isFollowing } = message.data
      // Update discover users - remove if now following
      if (isFollowing) {
        setDiscoverUsers((prev) => prev.filter((user) => user._id !== userId))
      }
    } else if (message.name === 'new-activity') {
      // setActivities((prev) => [message.data, ...prev.slice(0, 9)]) // Keep latest 10
    }
  })

  // Handle follow state changes
  const handleFollowChange = useCallback(
    (userId: string, isFollowing: boolean) => {
      // Publish to Ably channel
      channel.publish('follow-change', { userId, isFollowing })

      // Update local state
      if (isFollowing) {
        setDiscoverUsers((prev) => prev.filter((user) => user._id !== userId))
      }
    },
    [channel]
  )

  const handleTopicClick = useCallback((tag: string) => {
    // Navigate to filtered feed
    window.location.href = `/?topic=${encodeURIComponent(tag)}`
  }, [])

  // Filter out users that are already in the discover section to avoid duplicates
  const filteredWhoToFollow = (whoToFollow || []).filter(
    (user: any) =>
      !discoverUsers.some((otherUser: any) => otherUser._id === user._id)
  )

  return (
    <div className="tablet:flex hidden w-80 flex-col gap-y-4 pl-8">
      {/* Discover People Section */}
      <div className="flex flex-col gap-y-4 rounded-lg border border-solid border-neutral-200 bg-white p-4 drop-shadow-md">
        <h3 className="text-lg font-semibold text-gray-800">Discover People</h3>
        {discoverUsers.length === 0 ? (
          <p className="text-sm text-gray-500">No new people to discover!</p>
        ) : (
          discoverUsers.slice(0, 3).map((user: UserInterface) => (
            <div
              key={`discover-${user._id}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  gender={user.gender}
                  src={user.profilePicture?.url || null}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </div>
              <Button
                onClick={() => handleFollowChange(user._id, true)}
                className="rounded-md bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
              >
                Follow
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Trending Topics Section */}
      <div className="flex flex-col gap-y-4 rounded-lg border border-solid border-neutral-200 bg-white p-4 drop-shadow-md">
        <h3 className="text-lg font-semibold text-gray-800">Trending Topics</h3>
        {topicsLoading ? (
          <div className="text-sm text-gray-500">Loading topics...</div>
        ) : trendingTopics.length === 0 ? (
          <p className="text-sm text-gray-500">No trending topics</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(trendingTopics || []).slice(0, 6).map((topic: any) => (
              <span
                key={`topic-${topic.tag}`}
                className="cursor-pointer rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200"
                onClick={() => handleTopicClick(topic.tag)}
              >
                #{topic.tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Who to Follow Section */}
      {filteredWhoToFollow.length > 0 && (
        <div className="flex flex-col gap-y-4 rounded-lg border border-solid border-neutral-200 bg-white p-4 drop-shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Who to Follow</h3>
          {filteredWhoToFollow.slice(0, 3).map((user: UserInterface) => (
            <div
              key={`follow-${user._id}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  gender={user.gender}
                  src={user.profilePicture?.url || null}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </div>
              <Button
                onClick={() => handleFollowChange(user._id, true)}
                className="rounded-md bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Trending Posts Section */}
      <div className="flex flex-col gap-y-4 rounded-lg border border-solid border-neutral-200 bg-white p-4 drop-shadow-md">
        <h3 className="text-lg font-semibold text-gray-800">Trending Posts</h3>
        {trendingPostsLoading ? (
          <div className="text-sm text-gray-500">Loading posts...</div>
        ) : trendingPosts.length === 0 ? (
          <p className="text-sm text-gray-500">No trending posts</p>
        ) : (
          (trendingPosts || []).slice(0, 3).map((post: any) => (
            <div
              key={`trending-post-${post._id || post.data?._id}`}
              className="border-b border-gray-100 pb-2 last:border-b-0"
            >
              <p className="line-clamp-2 text-sm text-gray-800">
                {post.type === 'post'
                  ? post.data?.content || post.content
                  : post.type === 'share'
                    ? post.data?.originalPost?.content
                    : post.content || 'No content'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                by{' '}
                {post.type === 'post'
                  ? post.data?.author?.firstName || post.author?.firstName
                  : post.type === 'share'
                    ? post.data?.originalPost?.author?.firstName
                    : 'Unknown'}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="flex flex-col gap-y-4 rounded-lg border border-solid border-neutral-200 bg-white p-4 drop-shadow-md">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        {activitiesLoading ? (
          <div className="text-sm text-gray-500">Loading activities...</div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity</p>
        ) : (
          (activities || []).slice(0, 5).map((activity: any, index: number) => (
            <div
              key={`activity-${activity._id || activity.id || index}`}
              className="text-sm text-gray-600"
            >
              {activity.message || 'Activity update'}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Main component - simplified since we use global AblyProvider
const RightNavWithAbly = ({
  otherUsers,
  currentUserId
}: {
  otherUsers: UserInterface[]
  currentUserId: string
}) => {
  return (
    <ChannelProvider channelName="user-interactions">
      <RightNavContent otherUsers={otherUsers} currentUserId={currentUserId} />
    </ChannelProvider>
  )
}

export default RightNavWithAbly
