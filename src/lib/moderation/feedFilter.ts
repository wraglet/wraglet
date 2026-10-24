import type { IPostDocument } from '@/models/Post'
import type { FilterQuery } from 'mongoose'

export const FEED_VISIBLE_MODERATION_STATUSES = [
  'approved',
  'needs_review'
] as const

export const FEED_HIDDEN_MODERATION_STATUSES = ['pending', 'rejected'] as const

/**
 * Posts created before moderation existed have no `moderationStatus` field in Mongo
 * (the schema default only applies on hydration), so filter by exclusion: anything
 * that is not explicitly hidden is visible, matching the `approved` default.
 */
export const buildFeedModerationFilter = (): FilterQuery<IPostDocument> => ({
  moderationStatus: { $nin: [...FEED_HIDDEN_MODERATION_STATUSES] }
})

export const buildVideoFeedFilter = (): FilterQuery<IPostDocument> => ({
  ...buildFeedModerationFilter(),
  'content.video.url': { $exists: true, $ne: '' }
})
