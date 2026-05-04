import type { IPost } from '@/models/Post'

import type {
  ReactionGroup,
  ReactionParticipant
} from '@/components/feed/post/postCardTypes'

export const buildPostReactionGroups = (
  reactions: IPost['reactions'] | undefined,
  currentUserId: string | undefined
): {
  reactionCounts: Record<string, number>
  reactionGroups: ReactionGroup[]
} => {
  const reactionCounts: Record<string, number> = {}
  const groups: Record<string, ReactionGroup> = {}

  for (const reaction of reactions || []) {
    reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1

    if (!groups[reaction.type]) {
      groups[reaction.type] = {
        type: reaction.type,
        count: 0,
        users: []
      }
    }
    groups[reaction.type].count++

    if (
      currentUserId &&
      reaction.userId &&
      reaction.userId._id === currentUserId
    ) {
      groups[reaction.type].users.push(reaction.userId as ReactionParticipant)
    }
  }

  return {
    reactionCounts,
    reactionGroups: Object.values(groups)
  }
}
