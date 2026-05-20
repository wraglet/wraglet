import { shouldShowOnlineBadgeForUser } from '@/store/onlinePresence'
import { describe, expect, it } from 'vitest'

describe('shouldShowOnlineBadgeForUser', () => {
  const online = new Set(['u2'])
  const mutuals = new Set(['u2'])
  const convos = new Set(['u3'])

  it('returns false for self', () => {
    expect(
      shouldShowOnlineBadgeForUser({
        userId: 'me',
        currentUserId: 'me',
        onlineUserIds: online,
        mutualUserIds: mutuals,
        conversationUserIds: convos
      })
    ).toBe(false)
  })

  it('returns false when user is offline', () => {
    expect(
      shouldShowOnlineBadgeForUser({
        userId: 'u9',
        currentUserId: 'me',
        onlineUserIds: online,
        mutualUserIds: mutuals,
        conversationUserIds: convos
      })
    ).toBe(false)
  })

  it('returns true for online mutual', () => {
    expect(
      shouldShowOnlineBadgeForUser({
        userId: 'u2',
        currentUserId: 'me',
        onlineUserIds: online,
        mutualUserIds: mutuals,
        conversationUserIds: convos
      })
    ).toBe(true)
  })

  it('returns true for online conversation partner not mutual', () => {
    expect(
      shouldShowOnlineBadgeForUser({
        userId: 'u3',
        currentUserId: 'me',
        onlineUserIds: new Set(['u3']),
        mutualUserIds: mutuals,
        conversationUserIds: convos
      })
    ).toBe(true)
  })
})
