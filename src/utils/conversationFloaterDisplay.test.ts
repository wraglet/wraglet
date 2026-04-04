import type { IConversation } from '@/types/conversation'
import { describe, expect, it } from 'vitest'

import {
  getConversationFloaterDisplay,
  participantAvatarUrl
} from '@/utils/conversationFloaterDisplay'

describe('participantAvatarUrl', () => {
  it('returns null when missing user or picture', () => {
    expect(participantAvatarUrl(null)).toBeNull()
    expect(participantAvatarUrl({})).toBeNull()
  })

  it('accepts string profile picture', () => {
    expect(participantAvatarUrl({ profilePicture: '  https://x.test/a.png  ' })).toBe(
      'https://x.test/a.png'
    )
  })

  it('accepts object profile picture with url', () => {
    expect(
      participantAvatarUrl({
        profilePicture: { url: ' https://cdn.example/u.png ' }
      })
    ).toBe('https://cdn.example/u.png')
  })

  it('returns null for whitespace-only object url', () => {
    expect(participantAvatarUrl({ profilePicture: { url: '   ' } })).toBeNull()
  })

  it('returns null for object profile picture without usable url', () => {
    expect(participantAvatarUrl({ profilePicture: {} })).toBeNull()
  })
})

describe('getConversationFloaterDisplay', () => {
  it('returns empty display for null conversation', () => {
    expect(getConversationFloaterDisplay(null, 'u1')).toEqual({
      name: '',
      avatar: null,
      isGroup: false,
      users: [],
      gender: ''
    })
  })

  it('filters out current user for 1:1 chats', () => {
    const convo: IConversation = {
      _id: 'c1',
      isGroup: false,
      participants: [
        {
          _id: 'me',
          firstName: 'Me',
          lastName: 'User',
          username: 'me',
          profilePicture: 'https://a.test/me.png'
        },
        {
          _id: 'them',
          firstName: 'Pat',
          lastName: 'Lee',
          username: 'pat',
          profilePicture: 'https://a.test/them.png'
        }
      ]
    }
    const d = getConversationFloaterDisplay(convo, 'me')
    expect(d.name).toBe('Pat Lee')
    expect(d.users).toHaveLength(1)
    expect(d.users[0]._id).toBe('them')
    expect(d.avatar).toBe('https://a.test/them.png')
    expect(d.gender).toBe('')
  })

  it('uses group name when set', () => {
    const convo: IConversation = {
      _id: 'g1',
      isGroup: true,
      name: 'Writers',
      participants: [
        {
          _id: 'a',
          firstName: 'A',
          lastName: 'One',
          username: 'a1'
        }
      ]
    }
    const d = getConversationFloaterDisplay(convo, 'a')
    expect(d.name).toBe('Writers')
    expect(d.isGroup).toBe(true)
    expect(d.avatar).toBeNull()
  })

  it('builds group title from participant names when name is missing', () => {
    const convo: IConversation = {
      _id: 'g2',
      isGroup: true,
      participants: [
        {
          _id: 'a',
          firstName: 'Ann',
          lastName: 'Ng',
          username: 'an'
        },
        {
          _id: 'b',
          firstName: 'Bo',
          lastName: 'Li',
          username: 'bl'
        }
      ]
    }
    expect(getConversationFloaterDisplay(convo, 'a').name).toBe('Ann Ng, Bo Li')
  })
})
