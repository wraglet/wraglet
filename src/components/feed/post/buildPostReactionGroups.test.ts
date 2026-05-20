import { describe, expect, it } from 'vitest'

import { buildPostReactionGroups } from '@/components/feed/post/buildPostReactionGroups'

describe('buildPostReactionGroups', () => {
  it('returns empty structures when reactions are undefined', () => {
    expect(buildPostReactionGroups(undefined, 'u1')).toEqual({
      reactionCounts: {},
      reactionGroups: []
    })
  })

  it('groups counts and current user participants', () => {
    const { reactionCounts, reactionGroups } = buildPostReactionGroups(
      [
        {
          type: 'like',
          userId: { _id: 'u1' }
        },
        {
          type: 'like',
          userId: { _id: 'u2' }
        },
        {
          type: 'love',
          userId: { _id: 'u1' }
        }
      ],
      'u1'
    )

    expect(reactionCounts).toEqual({ like: 2, love: 1 })
    expect(reactionGroups).toHaveLength(2)
    const likeGroup = reactionGroups.find((g) => g.type === 'like')
    expect(likeGroup?.count).toBe(2)
    expect(likeGroup?.users).toHaveLength(1)
    expect(likeGroup?.users[0]._id).toBe('u1')
  })

  it('ignores reactions with missing or invalid type', () => {
    const { reactionCounts, reactionGroups } = buildPostReactionGroups(
      [
        { type: undefined as unknown as string, userId: { _id: 'u1' } },
        { type: 'like', userId: { _id: 'u2' } }
      ],
      'u2'
    )

    expect(reactionCounts).toEqual({ like: 1 })
    expect(reactionGroups).toHaveLength(1)
    expect(reactionGroups[0].type).toBe('like')
  })
})
