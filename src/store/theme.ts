import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
)

let themeInitialized = false
let mediaQueryCleanup: (() => void) | null = null

export function initTheme() {
  if (themeInitialized) return
  themeInitialized = true

  const theme = useThemeStore.getState().theme
  
  const applyTheme = () => {
    const currentTheme = useThemeStore.getState().theme
    const isDark = 
      currentTheme === 'dark' || 
      (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  applyTheme()
  
  // Clean up any previous listener before adding a new one
  if (mediaQueryCleanup) {
    mediaQueryCleanup()
  }

  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme()
    mediaQuery.addEventListener('change', handler)
    mediaQueryCleanup = () => mediaQuery.removeEventListener('change', handler)
  }

  // Re-apply theme when store changes
  useThemeStore.subscribe(() => {
    themeInitialized = false
    if (mediaQueryCleanup) {
      mediaQueryCleanup()
      mediaQueryCleanup = null
    }
    initTheme()
  })
}