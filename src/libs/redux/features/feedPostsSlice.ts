import { PostInterface } from '@/interfaces';
/* Core */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type FeedPostsProps = {
  posts: PostInterface[];
  isFeedPostsInitialized: boolean;
};

const initialState: FeedPostsProps = {
  posts: [],
  isFeedPostsInitialized: false
};

const feedPostsSlice = createSlice({
  name: 'feedPostsState',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setFeedPosts(state, action: PayloadAction<PostInterface[]>) {
      state.posts = action.payload;
    },
    setIsFeedPostsInitialized(state, action: PayloadAction<boolean>) {
      state.isFeedPostsInitialized = action.payload;
    },
    clearFeedPosts: (state) => {
      state.posts = initialState.posts;
      state.isFeedPostsInitialized = initialState.isFeedPostsInitialized;
    }
  }
});

export const { setFeedPosts, setIsFeedPostsInitialized, clearFeedPosts } =
  feedPostsSlice.actions;

export default feedPostsSlice.reducer;
