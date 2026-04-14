import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/database'

interface AuthState {
  user: User | null
  accessToken: string | null
  setUser: (user: User | null, token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: 'auth-storage' }
  )
)