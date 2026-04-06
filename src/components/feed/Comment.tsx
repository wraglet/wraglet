'use client'

import { FC } from 'react'
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

  return (
    <div className="flex items-start gap-2">
      <Avatar
        gender={author?.gender ?? DEFAULT_GENDER}
        src={author?.profilePicture?.url || null}
        size="h-6 w-6"
      />
      <div className="flex flex-1 flex-col">
        <div className="rounded-xl bg-[#E7ECF0] px-3 py-2">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-bold">{displayName}</p>
            {comment.createdAt && (
              <p className="text-[8px] text-gray-600">
                {formatDistanceToNow(new Date(comment.createdAt.toString()), {
                  addSuffix: true
                })}
              </p>
            )}
          </div>
          <p className="text-xs break-words">{comment.content}</p>
        </div>
      </div>
    </div>
  )
}

export default Comment
