import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light' | 'dark' | 'system'

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      toggleTheme: () => {
        const current = get().theme
        const next = current === 'light' ? 'dark' : 'light'
        set({ theme: next })
        applyTheme(next)
      },

      initTheme: () => {
        applyTheme(get().theme)
      },
    }),
    {
      name: 'eduflow-theme',
    }
  )
)

function applyTheme(theme) {
  const root = document.documentElement
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  root.classList.toggle('dark', isDark)
}

export default useThemeStore
