import { create } from 'zustand'

type FeedPostsProps = {
  posts: any[] // Changed to any[] to handle both posts and shares
  isFeedPostsInitialized: boolean
  setFeedPosts: (posts: any[]) => void
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
