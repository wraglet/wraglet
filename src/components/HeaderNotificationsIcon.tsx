'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import useUserStore from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import { useChannel } from 'ably/react'
import { formatDistanceToNow } from 'date-fns'

import Avatar from '@/components/Avatar'
import { BellIcon } from '@/components/NavIcons'

interface HeaderNotificationsIconProps {
  userId: string
  initialUnreadCount?: number
  ablyError?: boolean
}

const HeaderNotificationsIcon = ({
  userId,
  initialUnreadCount = 0,
  ablyError = false
}: HeaderNotificationsIconProps) => {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user: currentUser } = useUserStore()

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
    enabled: dropdownOpen
  })

  // Listen for real-time notification updates
  useChannel(`user-${userId}-notifications`, (message) => {
    console.log('Notification Ably event:', message)

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

  const getNotificationLink = (notification: any) => {
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

  return (
    <div className="relative flex" ref={dropdownRef}>
      <button
        className="relative focus:outline-none"
        onClick={() => setDropdownOpen((open) => !open)}
        aria-label="Open notifications"
      >
        <BellIcon className="h-5 w-5 text-white" />
        {ablyError ? (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs font-bold text-white">
            ?
          </span>
        ) : (
          unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-xs font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-9 w-80 rounded-lg border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b p-3">
            <span className="font-semibold text-gray-700">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {loading ? (
              <li className="p-4 text-center text-gray-400">Loading...</li>
            ) : notifications.length === 0 ? (
              <li className="p-4 text-center text-gray-400">
                No notifications yet
              </li>
            ) : (
              notifications.map((notification: any) => (
                <li key={notification._id}>
                  <Link
                    href={getNotificationLink(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-blue-50 ${
                      !notification.read ? 'bg-blue-50/50 font-medium' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {notification.sender ? (
                        <Avatar
                          src={notification.sender.profilePicture?.url || null}
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
                            className={`text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}
                          >
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true
                              }
                            )}
                          </p>
                        </div>

                        {!notification.read && (
                          <div className="ml-2 h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>

          <div className="border-t p-2 text-center">
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
