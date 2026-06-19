import { describe, expect, it } from 'vitest'

import type { IConversation } from '@/types/conversation'
import {
  getConversationHeaderParticipants,
  getMessagesAsideClassName
} from '@/components/chat/messagesLayout'

const baseConversation = {
  _id: 'c1',
  isGroup: false,
  participants: [
    { _id: 'u1', firstName: 'A', lastName: 'One', username: 'aone' },
    { _id: 'u2', firstName: 'B', lastName: 'Two', username: 'btwo' }
  ]
} as IConversation

describe('getConversationHeaderParticipants', () => {
  it('returns empty state when conversation is null', () => {
    expect(getConversationHeaderParticipants(null, 'u1')).toEqual({
      participants: [],
      isGroup: false
    })
  })

  it('filters out the current user in a DM', () => {
    const { participants, isGroup } = getConversationHeaderParticipants(
      baseConversation,
      'u1'
    )

    expect(isGroup).toBe(false)
    expect(participants).toHaveLength(1)
    expect(participants[0]._id).toBe('u2')
  })

  it('keeps all participants for group chats', () => {
    const groupConversation = {
      ...baseConversation,
      isGroup: true
    } as IConversation

    const { participants, isGroup } = getConversationHeaderParticipants(
      groupConversation,
      'u1'
    )

    expect(isGroup).toBe(true)
    expect(participants).toHaveLength(2)
  })
})

describe('getMessagesAsideClassName', () => {
  it('uses full-width mobile list layout when showing conversation list', () => {
    const className = getMessagesAsideClassName({
      showMobileConversationList: true,
      showContactsSidebar: false,
      selectedId: null
    })

    expect(className).toContain('max-lg:w-full')
    expect(className).toContain('max-lg:translate-x-0')
  })

  it('hides drawer aside on mobile when a chat is selected', () => {
    const className = getMessagesAsideClassName({
      showMobileConversationList: false,
      showContactsSidebar: false,
      selectedId: 'c1'
    })

    expect(className).toContain('max-lg:hidden')
  })

  it('scopes drawer positioning to mobile only', () => {
    const className = getMessagesAsideClassName({
      showMobileConversationList: false,
      showContactsSidebar: false,
      selectedId: 'c1'
    })

    expect(className).toContain('max-lg:fixed')
    expect(className).toContain('max-lg:top-14')
    expect(className.split(/\s+/)).not.toContain('fixed')
    expect(className.split(/\s+/)).not.toContain('top-14')
  })

  it('shows drawer when sidebar is open on mobile', () => {
    const className = getMessagesAsideClassName({
      showMobileConversationList: false,
      showContactsSidebar: true,
      selectedId: null
    })

    expect(className).toContain('translate-x-0')
  })
})
