import { create } from 'zustand'

interface Photo {
  url: string
  key: string
  type: 'post' | 'avatar'
  createdAt: string
}

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  username: string
  gender: string
  profilePicture?: {
    url: string
  }
  photoCollection: Photo[]
  updatedAt: string
  // ... other user fields
}

interface UserStore {
  user: User | null
  setUser: (user: User | null) => void
  updatePhotoCollection: (photos: Photo[]) => void
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updatePhotoCollection: (photos) =>
    set((state) => ({
      user: state.user ? { ...state.user, photoCollection: photos } : null
    }))
}))

export default useUserStore
