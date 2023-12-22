import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import globalReducer from './features/globalSlice';
import feedPostsReducer from './features/feedPostsSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      userState: userReducer,
      globalState: globalReducer,
      feedPostsState: feedPostsReducer
    }
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
