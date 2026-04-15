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
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
        applyThemeToDOM(theme)
      },
    }),
    { name: 'theme-storage' }
  )
)

function applyThemeToDOM(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

let initialized = false

export function initTheme() {
  if (initialized) return
  initialized = true

  const theme = useThemeStore.getState().theme
  applyThemeToDOM(theme)

  // Listen for OS-level theme changes when in 'system' mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    const current = useThemeStore.getState().theme
    if (current === 'system') {
      applyThemeToDOM('system')
    }
  })
}