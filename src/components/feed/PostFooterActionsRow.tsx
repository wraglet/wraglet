'use client'

import {
  postCardAvatarSlotClass,
  postCardMenuSlotClass
} from '@/components/feed/post/postCardClassNames'
import PostReactionControl from '@/components/feed/PostReactionControl'
import PostVoteCommentShare from '@/components/feed/PostVoteCommentShare'

interface PostFooterActionsRowProps {
  postId: string
  userReaction?: { type: string }
  onReact: (type: string) => void
  onRemoveReaction: () => void
  userVote: 'upvote' | 'downvote' | undefined
  onVote: (voteType: 'upvote' | 'downvote') => void
  onToggleComment: () => void
  onShare: () => void
}

const PostFooterActionsRow = ({
  postId,
  userReaction,
  onReact,
  onRemoveReaction,
  userVote,
  onVote,
  onToggleComment,
  onShare
}: PostFooterActionsRowProps) => {
  return (
    <div className="flex items-center gap-2 border-t border-solid border-[#E7ECF0] px-3 py-2 sm:px-4 sm:py-3">
      <div className={postCardAvatarSlotClass} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 items-center justify-between">
        <PostReactionControl
          postId={postId}
          userReaction={userReaction}
          onReact={onReact}
          onRemoveReaction={onRemoveReaction}
        />
        <PostVoteCommentShare
          userVote={userVote}
          onVote={onVote}
          onToggleComment={onToggleComment}
          onShare={onShare}
        />
      </div>
      <div className={postCardMenuSlotClass} aria-hidden="true" />
    </div>
  )
}

export default PostFooterActionsRow
