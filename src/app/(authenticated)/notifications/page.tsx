'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { INotification } from '@/models/Notification'
import { BellIcon as HeroBellIcon } from '@heroicons/react/24/outline'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'

import Avatar from '@/components/Avatar'
import { Button } from '@/components/ui/button'

const NotificationsPage = () => {
  const [allNotifications, setAllNotifications] = useState<INotification[]>([])
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam = null }) => {
      const url = new URL('/api/notifications', window.location.origin)
      url.searchParams.set('limit', '20')
      if (pageParam) {
        url.searchParams.set('cursor', pageParam)
      }

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error('Failed to fetch notifications')
      return res.json()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: null
  })

  // Flatten all pages of notifications
  useEffect(() => {
    if (data?.pages) {
      const allNotifs = data.pages.flatMap((page) => page.notifications || [])
      setAllNotifications(allNotifs)
    }
  }, [data])

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      if (!res.ok) throw new Error('Failed to mark as read')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['header-notifications'] })
    }
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })
      if (!res.ok) throw new Error('Failed to mark all as read')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['header-notifications'] })
    }
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return '👥'
      case 'comment':
        return '💬'
      case 'reaction':
        return '❤️'
      case 'new_post':
        return '📝'
      case 'share':
        return '🔄'
      case 'admin':
        return '⚠️'
      case 'system':
        return 'ℹ️'
      default:
        return '🔔'
    }
  }

  const getNotificationLink = (notification: INotification) => {
    switch (notification.type) {
      case 'follow':
        // Redirect to the follower's profile
        return `/${notification.sender?.username || ''}`

      case 'comment':
        // Redirect to the specific post
        if (notification.data?.postId) {
          return `/post/${notification.data.postId}`
        }
        return '/feed'

      case 'reaction':
        // Redirect to the specific post
        if (notification.data?.postId) {
          return `/post/${notification.data.postId}`
        }
        return '/feed'

      case 'new_post':
      case 'share':
        // Redirect to the specific post (for both new posts and shares)
        if (notification.data?.postId) {
          return `/post/${notification.data.postId}`
        }
        return '/feed'

      case 'admin':
      case 'system':
        // Keep admin/system notifications at feed for now
        return '/feed'

      default:
        return '/feed'
    }
  }

  const handleNotificationClick = (notification: INotification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification._id)
    }
  }

  const unreadCount = allNotifications.filter((n) => !n.read).length

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <HeroBellIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Unable to load notifications
            </h3>
            <p className="text-gray-500">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HeroBellIcon className="h-6 w-6 text-gray-500" />
              <h1 className="text-xl font-semibold text-gray-900">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-200">
          {allNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <HeroBellIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No notifications yet
                </h3>
                <p className="text-gray-500">
                  When you get notifications, they&apos;ll show up here.
                </p>
              </div>
            </div>
          ) : (
            allNotifications.map((notification) => (
              <div key={notification._id}>
                <Link
                  href={getNotificationLink(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {notification.sender ? (
                      <Avatar
                        src={notification.sender.profilePicture?.url || null}
                        alt={notification.sender.firstName}
                        className="h-12 w-12"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}
                        >
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(notification.createdAt!),
                            {
                              addSuffix: true
                            }
                          )}
                        </p>
                      </div>

                      {!notification.read && (
                        <div className="ml-4 h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {hasNextPage && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load more notifications'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
