'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { Gender } from '@/interfaces'
import { getNotificationLink } from '@/lib/notificationLinks'
import {
  centeredListPageBodyTextClassName,
  centeredListPageBodyTextUnreadClassName,
  centeredListPageCardClassName,
  centeredListPageCardHeaderClassName,
  centeredListPageEmptyBodyClassName,
  centeredListPageEmptyIconClassName,
  centeredListPageEmptyStateClassName,
  centeredListPageEmptyTitleClassName,
  centeredListPageFooterClassName,
  centeredListPageListItemClassName,
  centeredListPageMetaClassName,
  centeredListPageTitleClassName
} from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { INotification } from '@/models/Notification'
import { BellIcon as HeroBellIcon } from '@heroicons/react/24/outline'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'

import { DEFAULT_GENDER } from '@/data/constants'
import CenteredListPageShell from '@/components/layout/CenteredListPageShell'
import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

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
    case 'new_blog':
      return '📰'
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

const getNotificationRowClassName = (isRead: boolean) =>
  cn(centeredListPageListItemClassName, isRead ? undefined : 'bg-blue-50/50')

const getNotificationMessageClassName = (isRead: boolean) =>
  isRead
    ? centeredListPageBodyTextClassName
    : centeredListPageBodyTextUnreadClassName

const invalidateNotificationQueries = (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  queryClient.invalidateQueries({ queryKey: ['notifications'] })
  queryClient.invalidateQueries({ queryKey: ['header-notifications'] })
}

const NotificationsPageClient = () => {
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
      const url = new URL('/api/notifications', globalThis.location.origin)
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

  const allNotifications = useMemo(
    () => data?.pages?.flatMap((page) => page.notifications || []) ?? [],
    [data]
  )

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
      invalidateNotificationQueries(queryClient)
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
      invalidateNotificationQueries(queryClient)
    }
  })

  const handleNotificationClick = (notification: INotification) => {
    if (notification.read) return
    markAsReadMutation.mutate(notification._id)
  }

  const unreadCount = allNotifications.filter((n) => n.read === false).length

  if (isLoading) {
    return (
      <CenteredListPageShell>
        <div className={centeredListPageEmptyStateClassName}>
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-sky-600" />
          <p className={centeredListPageEmptyBodyClassName}>
            Loading notifications...
          </p>
        </div>
      </CenteredListPageShell>
    )
  }

  if (isError) {
    return (
      <CenteredListPageShell>
        <div className={centeredListPageEmptyStateClassName}>
          <HeroBellIcon className={centeredListPageEmptyIconClassName} />
          <h3 className={centeredListPageEmptyTitleClassName}>
            Unable to load notifications
          </h3>
          <p className={centeredListPageEmptyBodyClassName}>
            Please try refreshing the page.
          </p>
        </div>
      </CenteredListPageShell>
    )
  }

  return (
    <CenteredListPageShell>
      <div className={centeredListPageCardClassName}>
        <div className={centeredListPageCardHeaderClassName}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <HeroBellIcon className="h-5 w-5 shrink-0 text-gray-500" />
              <h1 className={centeredListPageTitleClassName}>Notifications</h1>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                  {unreadCount} unread
                </span>
              ) : null}
            </div>
            {unreadCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all as read
              </Button>
            ) : null}
          </div>
        </div>

        <div className="divide-y divide-neutral-200">
          {allNotifications.length === 0 ? (
            <div className={centeredListPageEmptyStateClassName}>
              <HeroBellIcon className={centeredListPageEmptyIconClassName} />
              <h3 className={centeredListPageEmptyTitleClassName}>
                No notifications yet
              </h3>
              <p className={centeredListPageEmptyBodyClassName}>
                When you get notifications, they&apos;ll show up here.
              </p>
            </div>
          ) : (
            allNotifications.map((notification) => (
              <div key={notification._id}>
                <Link
                  href={getNotificationLink(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className={getNotificationRowClassName(notification.read)}
                >
                  <div className="shrink-0">
                    {notification.sender ? (
                      <Avatar
                        gender={
                          (notification.sender.gender as Gender | undefined) ??
                          DEFAULT_GENDER
                        }
                        src={notification.sender.profilePicture?.url || null}
                        alt={notification.sender.firstName}
                        className="h-9 w-9"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-base">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className={getNotificationMessageClassName(
                            notification.read
                          )}
                        >
                          {notification.message}
                        </p>
                        {notification.createdAt ? (
                          <p className={centeredListPageMetaClassName}>
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </p>
                        ) : null}
                      </div>

                      {notification.read === false ? (
                        <div
                          className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>

        {hasNextPage ? (
          <div className={centeredListPageFooterClassName}>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load more notifications'}
            </Button>
          </div>
        ) : null}
      </div>
    </CenteredListPageShell>
  )
}

export default NotificationsPageClient
