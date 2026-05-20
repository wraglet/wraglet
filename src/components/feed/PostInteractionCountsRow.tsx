'use client'

import {
  postCardAvatarSlotClass,
  postCardMenuSlotClass
} from '@/components/feed/post/postCardClassNames'
import type { ReactionGroup } from '@/components/feed/post/postCardTypes'
import ReactionLottieBadge from '@/components/feed/post/ReactionLottieBadge'
import PostVoteCounts from '@/components/feed/PostVoteCounts'

interface PostInteractionCountsRowProps {
  reactionGroups: ReactionGroup[]
  reactionCounts: Record<string, number>
  commentCount: number
  upvotes: number
  downvotes: number
  shareCount: number | undefined
  postId: string
}

const PostInteractionCountsRow = ({
  reactionGroups,
  reactionCounts,
  commentCount,
  upvotes,
  downvotes,
  shareCount,
  postId
}: PostInteractionCountsRowProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 sm:px-4 sm:py-3">
      <div className={postCardAvatarSlotClass} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 items-center justify-between">
        <div className="flex items-center gap-x-1">
          {Object.keys(reactionCounts).length > 0 && (
            <div className="flex items-center gap-x-1">
              <div className="flex -space-x-1">
                {reactionGroups.slice(0, 3).map((group, index) => (
                  <div
                    key={`${group.type}-${index}`}
                    className="relative flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white"
                  >
                    <ReactionLottieBadge type={group.type} postId={postId} />
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {Object.values(reactionCounts).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-x-3 text-xs text-gray-500">
          {commentCount > 0 && (
            <span>
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </span>
          )}
          <PostVoteCounts upvotes={upvotes} downvotes={downvotes} />
          {shareCount !== undefined && shareCount > 0 && (
            <span>
              {shareCount} {shareCount === 1 ? 'share' : 'shares'}
            </span>
          )}
        </div>
      </div>
      <div className={postCardMenuSlotClass} aria-hidden="true" />
    </div>
  )
}

export default PostInteractionCountsRow
