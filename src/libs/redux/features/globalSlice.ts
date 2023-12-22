import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type GlobalProps = {
  justLoggedIn: boolean;
  userSliceInitialized: boolean;
};

const initialState: GlobalProps = {
  justLoggedIn: false,
  userSliceInitialized: false
};

const globalSlice = createSlice({
  name: 'globalState',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setJustLoggedIn(state, action: PayloadAction<boolean>) {
      state.justLoggedIn = action.payload;
    },
    setUserSliceInitialized(state, action: PayloadAction<boolean>) {
      state.userSliceInitialized = action.payload;
    },
    clearGlobalState: (state) => {
      state.justLoggedIn = initialState.justLoggedIn;
      state.userSliceInitialized = initialState.userSliceInitialized;
    }
  }
});

export const { setJustLoggedIn, setUserSliceInitialized, clearGlobalState } =
  globalSlice.actions;

export default globalSlice.reducer;
