import { create } from 'zustand'

interface BlogModalStore {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const useBlogModalStore = create<BlogModalStore>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false })
}))

export default useBlogModalStore
