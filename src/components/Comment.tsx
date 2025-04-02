'use client'

import { FC } from 'react'
import { IComment } from '@/models/Comment'
import { formatDistanceToNow } from 'date-fns'

import Avatar from '@/components/Avatar'

interface Props {
  comment: IComment
}

const Comment: FC<Props> = ({ comment }) => {
  return (
    <div className="flex items-start gap-2">
      <Avatar
        gender={comment.author.gender}
        src={comment.author.profilePicture?.url || null}
        size="h-6 w-6"
      />
      <div className="flex flex-1 flex-col">
        <div className="rounded-xl bg-[#E7ECF0] px-3 py-2">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-bold">
              {comment.author.firstName} {comment.author.lastName}
            </p>
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
