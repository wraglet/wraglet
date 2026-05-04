import type { IPostReaction } from '@/models/PostReaction'

export type ReactionParticipant = IPostReaction['userId']

export interface ReactionGroup {
  type: string
  count: number
  users: ReactionParticipant[]
}
