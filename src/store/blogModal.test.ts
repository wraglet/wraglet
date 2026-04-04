import { afterEach, describe, expect, it } from 'vitest'

import useBlogModalStore from '@/store/blogModal'

describe('useBlogModalStore', () => {
  afterEach(() => {
    useBlogModalStore.setState({ isOpen: false })
  })

  it('toggles open state', () => {
    const s = useBlogModalStore.getState()
    expect(s.isOpen).toBe(false)
    s.openModal()
    expect(useBlogModalStore.getState().isOpen).toBe(true)
    useBlogModalStore.getState().closeModal()
    expect(useBlogModalStore.getState().isOpen).toBe(false)
  })
})
