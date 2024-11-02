import { create } from 'zustand'

type GlobalProps = {
  justLoggedIn: boolean
  userInitialized: boolean
  setJustLoggedIn: (justLoggedIn: boolean) => void
  setUserInitialized: (initialized: boolean) => void
  clearGlobalState: () => void
}

const useGlobalStore = create<GlobalProps>((set) => ({
  justLoggedIn: false,
  userInitialized: false,
  setJustLoggedIn: (justLoggedIn) => set({ justLoggedIn }),
  setUserInitialized: (initialized) => set({ userInitialized: initialized }),
  clearGlobalState: () => set({ justLoggedIn: false, userInitialized: false })
}))

export default useGlobalStore
