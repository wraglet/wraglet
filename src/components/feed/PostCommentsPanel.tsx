'use client'

import type { FormEvent, RefObject } from 'react'
import Link from 'next/link'
import type { Gender } from '@/interfaces'
import { IComment } from '@/models/Comment'
import type { User } from '@/store/user'

import CommentComponent from '@/components/feed/Comment'
import {
  COMMENT_INPUT_CLASS,
  postCardAvatarSlotClass,
  postCardMenuSlotClass
} from '@/components/feed/post/postCardClassNames'
import Avatar from '@/components/shared/Avatar'
import Input from '@/components/shared/Input'

interface PostCommentsPanelProps {
  showCommentInput: boolean
  contentRef: RefObject<HTMLDivElement | null>
  postComments: IComment[]
  user: User | null
  currentUserProfileHref: string | null
  comment: string
  onCommentChange: (value: string) => void
  onCommentSubmit: (e: FormEvent<HTMLFormElement>) => void
  isCommentDocument: (comment: IComment | string) => comment is IComment
}

const PostCommentsPanel = ({
  showCommentInput,
  contentRef,
  postComments,
  user,
  currentUserProfileHref,
  comment,
  onCommentChange,
  onCommentSubmit,
  isCommentDocument
}: PostCommentsPanelProps) => {
  return (
    <div
      style={{ maxHeight: showCommentInput ? 'none' : '0px' }}
      ref={contentRef}
      className={`${
        showCommentInput ? 'border-t border-solid border-[#E7ECF0]' : 'hidden'
      } flex w-full gap-2 overflow-hidden px-3 pb-3 transition-all duration-300 ease-in-out sm:px-4 sm:pb-4`}
    >
      <div className={postCardAvatarSlotClass} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 pt-3 sm:gap-4 sm:pt-4">
        <div className="flex flex-col gap-2">
          {Array.isArray(postComments) &&
            postComments.map((c, index) => {
              if (!isCommentDocument(c)) return null
              return (
                <CommentComponent
                  key={c._id?.toString() || `comment-${index}`}
                  comment={c}
                />
              )
            })}
        </div>

        <form
          onSubmit={onCommentSubmit}
          className="flex items-center gap-2 border-t border-solid border-[#E7ECF0] pt-4"
        >
          {user?.gender ? (
            currentUserProfileHref ? (
              <Link
                href={currentUserProfileHref}
                className="shrink-0 rounded-full ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/40"
              >
                <Avatar
                  gender={user.gender as Gender}
                  size="h-6 w-6"
                  src={user.profilePicture?.url || null}
                />
              </Link>
            ) : (
              <Avatar
                gender={user.gender as Gender}
                size="h-6 w-6"
                src={user.profilePicture?.url || null}
              />
            )
          ) : (
            <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
          )}
          <div className="flex-1">
            <Input
              type="text"
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              className={COMMENT_INPUT_CLASS}
              placeholder="Write a comment..."
            />
          </div>
        </form>
      </div>
      <div className={postCardMenuSlotClass} aria-hidden="true" />
    </div>
  )
}

export default PostCommentsPanel
