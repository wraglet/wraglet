import { UserInterface } from '@/interfaces';
/* Core */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type UserProps = {
  user: UserInterface | null;
};

const initialState: UserProps = {
  user: null
};

const userSlice = createSlice({
  name: 'userState',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setUser(state, action: PayloadAction<UserInterface>) {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = initialState.user;
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
