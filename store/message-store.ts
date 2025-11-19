import { create } from 'zustand'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string | null
  createdAt: string
  sender: {
    id: string
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
  }
}

interface MessageStore {
  messages: Record<string, Message[]> // key is conversationId (sorted user IDs)
  addMessage: (conversationId: string, message: Message) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  clearMessages: (conversationId: string) => void
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: {},
  addMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.messages[conversationId] || []
      // Avoid duplicates
      if (existing.some((m) => m.id === message.id)) {
        return state
      }
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existing, message],
        },
      }
    }),
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),
  clearMessages: (conversationId) =>
    set((state) => {
      const newMessages = { ...state.messages }
      delete newMessages[conversationId]
      return { messages: newMessages }
    }),
}))
