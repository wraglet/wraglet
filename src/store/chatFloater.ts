import { create } from 'zustand'

interface FloaterChat {
  conversationId: string
}

interface ChatFloaterStore {
  openChats: FloaterChat[]
  minimizedChats: FloaterChat[]
  openChat: (conversationId: string) => void
  closeChat: (conversationId: string) => void
  minimizeChat: (conversationId: string) => void
  restoreChat: (conversationId: string) => void
  /** Adds a chat head for an incoming message if the window is not already open/minimized */
  pinIncomingChat: (conversationId: string) => void
}

const useChatFloaterStore = create<ChatFloaterStore>((set) => ({
  openChats: [],
  minimizedChats: [],
  openChat: (conversationId) =>
    set((state) => {
      // Remove from minimized if present, add to open if not already
      const alreadyOpen = state.openChats.some(
        (c) => c.conversationId === conversationId
      )
      const stillMinimized = state.minimizedChats.filter(
        (c) => c.conversationId !== conversationId
      )
      return alreadyOpen
        ? { minimizedChats: stillMinimized }
        : {
            openChats: [...state.openChats, { conversationId }],
            minimizedChats: stillMinimized
          }
    }),
  closeChat: (conversationId) =>
    set((state) => ({
      openChats: state.openChats.filter(
        (c) => c.conversationId !== conversationId
      ),
      minimizedChats: state.minimizedChats.filter(
        (c) => c.conversationId !== conversationId
      )
    })),
  minimizeChat: (conversationId) =>
    set((state) => {
      const chat = state.openChats.find(
        (c) => c.conversationId === conversationId
      )
      if (!chat) return {}
      return {
        openChats: state.openChats.filter(
          (c) => c.conversationId !== conversationId
        ),
        minimizedChats: [...state.minimizedChats, chat]
      }
    }),
  restoreChat: (conversationId) =>
    set((state) => {
      const chat = state.minimizedChats.find(
        (c) => c.conversationId === conversationId
      )
      if (!chat) return {}
      return {
        minimizedChats: state.minimizedChats.filter(
          (c) => c.conversationId !== conversationId
        ),
        openChats: [...state.openChats, chat]
      }
    }),
  pinIncomingChat: (conversationId) =>
    set((state) => {
      const inOpen = state.openChats.some(
        (c) => c.conversationId === conversationId
      )
      const inMinimized = state.minimizedChats.some(
        (c) => c.conversationId === conversationId
      )
      if (inOpen || inMinimized) return {}
      return {
        minimizedChats: [...state.minimizedChats, { conversationId }]
      }
    })
}))

export default useChatFloaterStore
