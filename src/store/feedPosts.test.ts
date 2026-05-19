import useFeedPostsStore from '@/store/feedPosts'
import { afterEach, describe, expect, it } from 'vitest'

describe('useFeedPostsStore', () => {
  afterEach(() => {
    useFeedPostsStore.getState().clearFeedPosts()
  })

  it('setFeedPosts and clear reset state', () => {
    useFeedPostsStore.getState().setFeedPosts([{ _id: 'p1' }])
    expect(useFeedPostsStore.getState().posts).toHaveLength(1)
    useFeedPostsStore.getState().setIsFeedPostsInitialized(true)
    expect(useFeedPostsStore.getState().isFeedPostsInitialized).toBe(true)
    useFeedPostsStore.getState().clearFeedPosts()
    expect(useFeedPostsStore.getState().posts).toEqual([])
    expect(useFeedPostsStore.getState().isFeedPostsInitialized).toBe(false)
  })
})
