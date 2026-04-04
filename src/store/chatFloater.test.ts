import { afterEach, describe, expect, it } from 'vitest'

import useChatFloaterStore from '@/store/chatFloater'

const reset = () => {
  useChatFloaterStore.setState({
    openChats: [],
    minimizedChats: []
  })
}

describe('useChatFloaterStore', () => {
  afterEach(reset)

  it('opens a chat and removes it from minimized', () => {
    const s = useChatFloaterStore.getState()
    s.openChat('a')
    s.minimizeChat('a')
    expect(useChatFloaterStore.getState().minimizedChats).toHaveLength(1)
    s.openChat('a')
    const next = useChatFloaterStore.getState()
    expect(next.openChats.map((c) => c.conversationId)).toContain('a')
    expect(next.minimizedChats).toHaveLength(0)
  })

  it('pinIncomingChat adds minimized head when not open', () => {
    useChatFloaterStore.getState().pinIncomingChat('new')
    expect(useChatFloaterStore.getState().minimizedChats).toEqual([
      { conversationId: 'new' }
    ])
  })

  it('pinIncomingChat is a no-op when already tracked', () => {
    const s = useChatFloaterStore.getState()
    s.openChat('x')
    s.pinIncomingChat('x')
    expect(useChatFloaterStore.getState().minimizedChats).toHaveLength(0)
  })

  it('pinIncomingChat does not duplicate a minimized chat', () => {
    const s = useChatFloaterStore.getState()
    s.openChat('m')
    s.minimizeChat('m')
    expect(useChatFloaterStore.getState().minimizedChats).toHaveLength(1)
    s.pinIncomingChat('m')
    expect(useChatFloaterStore.getState().minimizedChats).toHaveLength(1)
  })

  it('closeChat removes from both stacks', () => {
    const s = useChatFloaterStore.getState()
    s.openChat('a')
    s.openChat('b')
    s.minimizeChat('b')
    s.closeChat('a')
    s.closeChat('b')
    const next = useChatFloaterStore.getState()
    expect(next.openChats).toHaveLength(0)
    expect(next.minimizedChats).toHaveLength(0)
  })

  it('restoreChat moves from minimized to open', () => {
    const s = useChatFloaterStore.getState()
    s.openChat('z')
    s.minimizeChat('z')
    s.restoreChat('z')
    const next = useChatFloaterStore.getState()
    expect(next.openChats.map((c) => c.conversationId)).toContain('z')
    expect(next.minimizedChats).toHaveLength(0)
  })
})
