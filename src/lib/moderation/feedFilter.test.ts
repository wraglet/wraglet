import { describe, expect, it } from 'vitest'

import {
  buildFeedModerationFilter,
  buildVideoFeedFilter,
  FEED_HIDDEN_MODERATION_STATUSES,
  FEED_VISIBLE_MODERATION_STATUSES
} from './feedFilter'

const matchesFilter = (doc: { moderationStatus?: string }) => {
  const filter = buildFeedModerationFilter()
  const nin = filter.moderationStatus.$nin as string[]
  return (
    doc.moderationStatus === undefined || !nin.includes(doc.moderationStatus)
  )
}

describe('buildFeedModerationFilter', () => {
  it('hides pending and rejected posts', () => {
    for (const status of FEED_HIDDEN_MODERATION_STATUSES) {
      expect(matchesFilter({ moderationStatus: status })).toBe(false)
    }
  })

  it('shows approved and needs_review posts', () => {
    for (const status of FEED_VISIBLE_MODERATION_STATUSES) {
      expect(matchesFilter({ moderationStatus: status })).toBe(true)
    }
  })

  it('shows legacy posts that have no moderationStatus field', () => {
    expect(matchesFilter({})).toBe(true)
  })

  it('uses $nin so documents without the field are not excluded by Mongo', () => {
    expect(buildFeedModerationFilter()).toEqual({
      moderationStatus: { $nin: ['pending', 'rejected'] }
    })
  })
})

describe('buildVideoFeedFilter', () => {
  it('adds the video url requirement on top of the moderation filter', () => {
    expect(buildVideoFeedFilter()).toEqual({
      moderationStatus: { $nin: ['pending', 'rejected'] },
      'content.video.url': { $exists: true, $ne: '' }
    })
  })
})
