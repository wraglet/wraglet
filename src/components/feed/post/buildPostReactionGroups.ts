import type { IPost } from '@/models/Post'
import { normalizeReactionType } from '@/utils/reactionTypes'

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
    const reactionType = normalizeReactionType(reaction.type)
    if (!reactionType) continue

    reactionCounts[reactionType] = (reactionCounts[reactionType] ?? 0) + 1

    if (!groups[reactionType]) {
      groups[reactionType] = {
        type: reactionType,
        count: 0,
        users: []
      }
    }
    groups[reactionType].count++

    if (currentUserId && reaction.userId?._id === currentUserId) {
      groups[reactionType].users.push(reaction.userId as ReactionParticipant)
    }
  }

  return {
    reactionCounts,
    reactionGroups: Object.values(groups)
  }
}
