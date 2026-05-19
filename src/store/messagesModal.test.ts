import useMessagesModalStore from '@/store/messagesModal'
import { afterEach, describe, expect, it } from 'vitest'

describe('useMessagesModalStore', () => {
  afterEach(() => {
    useMessagesModalStore.getState().closeModal()
  })

  it('openModal sets user and isOpen; closeModal clears', () => {
    const user = { _id: 'u1', username: '@x' }
    useMessagesModalStore.getState().openModal(user)
    expect(useMessagesModalStore.getState().isOpen).toBe(true)
    expect(useMessagesModalStore.getState().targetUser).toEqual(user)
    useMessagesModalStore.getState().closeModal()
    expect(useMessagesModalStore.getState().isOpen).toBe(false)
    expect(useMessagesModalStore.getState().targetUser).toBeNull()
  })
})
