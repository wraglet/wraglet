import { create } from 'zustand';
import { UserInterface } from '@/interfaces';

type UserProps = {
  user: UserInterface | null;
  setUser: (user: UserInterface) => void;
  clearUser: () => void;
};

const useUserStore = create<UserProps>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;