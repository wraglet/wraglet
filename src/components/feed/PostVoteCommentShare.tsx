'use client'

import { FaRegComment } from 'react-icons/fa6'
import { LuArrowBigDown, LuArrowBigUp } from 'react-icons/lu'

import {
  ACTION_PILL_DOWNVOTE,
  ACTION_PILL_DOWNVOTE_ACTIVE,
  ACTION_PILL_NEUTRAL,
  ACTION_PILL_UPVOTE,
  ACTION_PILL_UPVOTE_ACTIVE
} from '@/components/feed/post/postCardClassNames'
import Button from '@/components/shared/Button'
import { ShareIcon } from '@/components/shared/Icons'

interface PostVoteCommentShareProps {
  userVote: 'upvote' | 'downvote' | undefined
  onVote: (voteType: 'upvote' | 'downvote') => void
  onToggleComment: () => void
  onShare: () => void
}

const PostVoteCommentShare = ({
  userVote,
  onVote,
  onToggleComment,
  onShare
}: PostVoteCommentShareProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={() => onVote('upvote')}
        className={`${
          userVote === 'upvote' ? ACTION_PILL_UPVOTE_ACTIVE : ACTION_PILL_UPVOTE
        }`}
      >
        <LuArrowBigUp className="text-xs" />
      </Button>

      <Button
        type="button"
        onClick={() => onVote('downvote')}
        className={`${
          userVote === 'downvote'
            ? ACTION_PILL_DOWNVOTE_ACTIVE
            : ACTION_PILL_DOWNVOTE
        }`}
      >
        <LuArrowBigDown className="text-xs" />
      </Button>

      <Button
        type="button"
        className={ACTION_PILL_NEUTRAL}
        onClick={onToggleComment}
      >
        <FaRegComment className="text-xs text-gray-600" />
      </Button>

      <div className="group relative">
        <Button type="button" className={ACTION_PILL_NEUTRAL} onClick={onShare}>
          <ShareIcon className="text-xs text-gray-600" />
        </Button>
      </div>
    </div>
  )
}

export default PostVoteCommentShare
