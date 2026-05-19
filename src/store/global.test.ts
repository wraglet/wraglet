import useGlobalStore from '@/store/global'
import { afterEach, describe, expect, it } from 'vitest'

describe('useGlobalStore', () => {
  afterEach(() => {
    useGlobalStore.getState().clearGlobalState()
  })

  it('sets flags and clears', () => {
    useGlobalStore.getState().setJustLoggedIn(true)
    useGlobalStore.getState().setUserInitialized(true)
    expect(useGlobalStore.getState().justLoggedIn).toBe(true)
    expect(useGlobalStore.getState().userInitialized).toBe(true)
    useGlobalStore.getState().clearGlobalState()
    expect(useGlobalStore.getState().justLoggedIn).toBe(false)
    expect(useGlobalStore.getState().userInitialized).toBe(false)
  })
})
