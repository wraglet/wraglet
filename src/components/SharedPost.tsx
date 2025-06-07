'use client'

import Link from 'next/link'
import { IPost } from '@/models/Post'
import { IShare } from '@/models/Share'
import { formatDistanceToNow } from 'date-fns'
import { FaGlobeAmericas, FaLock, FaUserFriends } from 'react-icons/fa'
import { FaArrowsRotate } from 'react-icons/fa6'

import Avatar from '@/components/Avatar'
import PostClientWrapper from '@/components/PostClientWrapper'

interface SharedPostProps {
  share: IShare & {
    originalPost: IPost
    sharedBy: {
      _id: string
      firstName: string
      lastName: string
      username: string
      profilePicture?: {
        url: string
      } | null
    }
  }
}

const SharedPost = ({ share }: SharedPostProps) => {
  const visibilityIcons = {
    public: FaGlobeAmericas,
    mutuals: FaUserFriends,
    only_me: FaLock
  }

  const VisibilityIcon = visibilityIcons[share.visibility]

  return (
    <div className="overflow-hidden border border-solid border-neutral-200 bg-white drop-shadow-md sm:rounded-lg">
      {/* Share Header */}
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <FaArrowsRotate className="h-4 w-4 flex-shrink-0 text-gray-500" />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Link
              href={`/${share.sharedBy.username}`}
              className="flex min-w-0 items-center gap-2 hover:underline"
            >
              <Avatar
                gender={share.sharedBy?.gender}
                src={share.sharedBy.profilePicture?.url || null}
                size="h-6 w-6"
              />
              <span className="truncate text-sm font-medium text-gray-900">
                {share.sharedBy.firstName} {share.sharedBy.lastName}
              </span>
            </Link>
            <span className="flex-shrink-0 text-sm text-gray-500">
              shared this
            </span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 text-xs text-gray-500">
            <VisibilityIcon className="h-3 w-3" />
            {share.createdAt && (
              <span>
                {formatDistanceToNow(new Date(share.createdAt), {
                  addSuffix: true
                })}
              </span>
            )}
          </div>
        </div>

        {/* Share Message */}
        {share.message && (
          <div className="mt-2 ml-7">
            <p className="text-sm text-gray-700">{share.message}</p>
          </div>
        )}
      </div>

      {/* Original Post */}
      <div className="p-0">
        <PostClientWrapper post={share.originalPost} />
      </div>
    </div>
  )
}

export default SharedPost
