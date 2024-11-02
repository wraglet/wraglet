import { PostInterface } from '@/interfaces'
import { create } from 'zustand'

type FeedPostsProps = {
  posts: PostInterface[]
  isFeedPostsInitialized: boolean
  setFeedPosts: (posts: PostInterface[]) => void
  setIsFeedPostsInitialized: (initialized: boolean) => void
  clearFeedPosts: () => void
}

const useFeedPostsStore = create<FeedPostsProps>((set) => ({
  posts: [],
  isFeedPostsInitialized: false,
  setFeedPosts: (posts) => set({ posts }),
  setIsFeedPostsInitialized: (initialized) =>
    set({ isFeedPostsInitialized: initialized }),
  clearFeedPosts: () => set({ posts: [], isFeedPostsInitialized: false })
}))

export default useFeedPostsStore
