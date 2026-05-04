'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  headerFlyoutNotificationsListClassName,
  headerFlyoutPanelClassName
} from '@/lib/headerFlyout'
import { useQuery } from '@tanstack/react-query'
import { useChannel } from 'ably/react'
import { formatDistanceToNow } from 'date-fns'

import Avatar from '@/components/shared/Avatar'
import { BellIcon } from '@/components/shared/Icons'

interface HeaderNotificationsIconProps {
  userId: string
  initialUnreadCount?: number
  ablyError?: boolean
}

const headerTriggerClass =
  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0ea5e9] sm:h-10 sm:w-10 sm:focus-visible:ring-offset-2'

const HeaderNotificationsIcon = ({
  userId,
  initialUnreadCount = 0,
  ablyError = false
}: HeaderNotificationsIconProps) => {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    data: notifications = [],
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: ['header-notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=10')
      const json = await res.json()
      if (json.unreadCount !== undefined) {
        setUnreadCount(json.unreadCount)
      }
      return json.notifications || []
    },
    enabled: true
  })

  // Listen for real-time notification updates
  useChannel(`user-${userId}-notifications`, (message) => {
    if (message.name === 'new-notification') {
      if (typeof message.data?.unreadCount === 'number') {
        setUnreadCount(message.data.unreadCount)
      } else {
        setUnreadCount((prev) => prev + 1)
      }
      if (dropdownOpen) refetch()
    } else if (message.name === 'unread-count') {
      if (typeof message.data?.unreadCount === 'number') {
        setUnreadCount(message.data.unreadCount)
      }
      if (dropdownOpen) refetch()
    }
  })

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // Handler for clicking a notification
  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notification._id })
        })
        setUnreadCount((prev) => Math.max(0, prev - 1))
        refetch()
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
    setDropdownOpen(false)
  }

  // Handler for mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })
      setUnreadCount(0)
      refetch()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

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

  const getPostNotificationLink = (notification: any) => {
    if (notification.data?.postId) {
      return `/post/${notification.data.postId}`
    }

    return '/feed'
  }

  const getNotificationLink = (notification: any) => {
    switch (notification.type) {
      case 'follow':
        // Redirect to the follower's profile
        return `/${notification.sender?.username || ''}`

      case 'comment':
        // Redirect to the specific post
        return getPostNotificationLink(notification)

      case 'reaction':
        // Redirect to the share if it's a share reaction, otherwise to the post
        if (notification.data?.shareId) {
          return `/post/${notification.data.shareId}`
        } else if (notification.data?.postId) {
          return `/post/${notification.data.postId}`
        }
        return '/feed'

      case 'new_post':
      case 'share':
        // Redirect to the specific post (for both new posts and shares)
        return getPostNotificationLink(notification)

      case 'admin':
      case 'system':
        // Keep admin/system notifications at feed for now
        return '/feed'

      default:
        return '/feed'
    }
  }

  let notificationList: ReactNode
  if (loading) {
    notificationList = (
      <li className="p-4 text-center text-gray-400">Loading...</li>
    )
  } else if (notifications.length === 0) {
    notificationList = (
      <li className="p-4 text-center text-gray-400">No notifications yet</li>
    )
  } else {
    notificationList = notifications.map((notification: any) => {
      const isUnread = !notification.read

      return (
        <li key={notification._id}>
          <Link
            href={getNotificationLink(notification)}
            onClick={() => handleNotificationClick(notification)}
            className={`flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-blue-50 ${
              isUnread ? 'bg-blue-50/50 font-medium' : ''
            }`}
          >
            <div className="flex-shrink-0">
              {notification.sender ? (
                <Avatar
                  src={notification.sender.profilePicture?.url}
                  gender={notification.sender.gender}
                  alt={notification.sender.firstName}
                  size="h-10 w-10"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                  {getNotificationIcon(notification.type)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}
                  >
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true
                    })}
                  </p>
                </div>

                {isUnread && (
                  <div className="ml-2 h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            </div>
          </Link>
        </li>
      )
    })
  }

  return (
    <div className="relative flex" ref={dropdownRef}>
      <button
        type="button"
        className={headerTriggerClass}
        onClick={() => setDropdownOpen((open) => !open)}
        aria-label="Open notifications"
      >
        <BellIcon className="h-5 w-5" />
        {ablyError ? (
          <span className="absolute -top-0.5 -right-0.5 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full border-2 border-sky-600 bg-slate-500 px-0.5 text-[10px] font-bold text-white shadow-sm">
            ?
          </span>
        ) : (
          unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full border-2 border-sky-600 bg-rose-500 px-1 text-[10px] leading-none font-bold text-white tabular-nums shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )
        )}
      </button>

      {dropdownOpen && (
        <div className={headerFlyoutPanelClassName}>
          <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 border-b p-3">
            <span className="min-w-0 font-semibold text-gray-700">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="shrink-0 text-xs text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <ul className={headerFlyoutNotificationsListClassName}>
            {notificationList}
          </ul>

          <div className="shrink-0 border-t p-2 text-center">
            <Link
              href="/notifications"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default HeaderNotificationsIcon
