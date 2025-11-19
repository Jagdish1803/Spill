import { create } from 'zustand'

interface ChatUser {
  id: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  status: string | null
  username: string | null
  email: string
}

interface UserStore {
  users: ChatUser[]
  currentUserId: string
  selectedUserId: string | null
  setUsers: (users: ChatUser[]) => void
  setCurrentUserId: (id: string) => void
  setSelectedUserId: (id: string | null) => void
  getSelectedUser: () => ChatUser | null
  fetchCurrentUserId: () => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  currentUserId: '',
  selectedUserId: null,
  setUsers: (users) => set({ users }),
  setCurrentUserId: (id) => set({ currentUserId: id }),
  setSelectedUserId: (id) => set({ selectedUserId: id }),
  getSelectedUser: () => {
    const { users, selectedUserId } = get()
    if (!selectedUserId) return null
    return users.find((u) => u.id === selectedUserId) || null
  },
  fetchCurrentUserId: async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const userData = await res.json()
        set({ currentUserId: userData.id })
      }
    } catch (error) {
      console.error('Error fetching current user ID:', error)
    }
  },
}))
