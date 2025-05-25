import { create } from 'zustand'

interface MessagesModalStore {
  isOpen: boolean
  targetUser: any | null
  openModal: (user: any) => void
  closeModal: () => void
}

const useMessagesModalStore = create<MessagesModalStore>((set) => ({
  isOpen: false,
  targetUser: null,
  openModal: (user) => set({ isOpen: true, targetUser: user }),
  closeModal: () => set({ isOpen: false, targetUser: null })
}))

export default useMessagesModalStore
