'use client'

import { FC } from 'react'
import Link from 'next/link'
import { profileHrefFromUsername } from '@/lib/profileHref'
import { IComment } from '@/models/Comment'
import { formatDistanceToNow } from 'date-fns'

import { DEFAULT_GENDER } from '@/data/constants'
import Avatar from '@/components/shared/Avatar'

interface Props {
  comment: IComment
}

const Comment: FC<Props> = ({ comment }) => {
  const author = comment.author
  const displayName = author
    ? [author.firstName, author.lastName].filter(Boolean).join(' ') ||
      'Unknown user'
    : 'Unknown user'
  const authorProfileHref = profileHrefFromUsername(author?.username)

  return (
    <div className="flex flex-1 flex-col">
      <div className="rounded-xl bg-[#E7ECF0] px-3 py-2">
        <div className="mb-1 flex items-center justify-between gap-2">
          {authorProfileHref ? (
            <Link
              href={authorProfileHref}
              className="flex min-h-0 min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/30"
            >
              <Avatar
                gender={author?.gender ?? DEFAULT_GENDER}
                src={author?.profilePicture?.url || null}
                size="h-6 w-6"
              />
              <p className="truncate text-xs font-bold">{displayName}</p>
            </Link>
          ) : (
            <div className="flex min-w-0 items-center gap-2">
              <Avatar
                gender={author?.gender ?? DEFAULT_GENDER}
                src={author?.profilePicture?.url || null}
                size="h-6 w-6"
              />
              <p className="truncate text-xs font-bold">{displayName}</p>
            </div>
          )}
          {comment.createdAt && (
            <p className="shrink-0 text-[8px] text-gray-600">
              {formatDistanceToNow(new Date(comment.createdAt.toString()), {
                addSuffix: true
              })}
            </p>
          )}
        </div>
        <p className="text-xs break-words">{comment.content}</p>
      </div>
    </div>
  )
}

export default Comment
