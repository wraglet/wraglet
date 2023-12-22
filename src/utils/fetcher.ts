import getCurrentUser from '@/actions/getCurrentUser';
import { setUser } from '@/libs/redux/features/userSlice';
import { AppDispatch } from '@/libs/redux/store';
import deJSONify from './deJSONify';

export const fetchUser = async (dispatch: AppDispatch) => {
  const jsonUser = await getCurrentUser();
  const user = deJSONify(jsonUser);

  dispatch(setUser(user!));
};
