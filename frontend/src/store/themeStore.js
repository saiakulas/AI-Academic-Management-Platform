import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Apply theme to <html> ───────────────────────────────────────
function applyTheme(theme) {
  const root = document.documentElement

  // Always remove first, then conditionally add
  root.classList.remove('dark')

  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark')
    }
    // else: light — class already removed above
  }
  // theme === 'light': class already removed, nothing to add
}

// ─── Listen for OS preference changes when in system mode ────────
let systemMediaQuery = null
let systemListener   = null

function attachSystemListener(store) {
  // Remove any existing listener first
  if (systemMediaQuery && systemListener) {
    systemMediaQuery.removeEventListener('change', systemListener)
    systemMediaQuery = null
    systemListener   = null
  }

  if (store.getState().theme === 'system') {
    systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemListener = () => applyTheme('system')
    systemMediaQuery.addEventListener('change', systemListener)
  }
}

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light' | 'dark' | 'system'

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
        // Attach or detach system listener
        attachSystemListener(useThemeStore)
      },

      /**
       * Topbar toggle: cycles light → dark → light (skips system).
       * If currently 'system', switches to the effective opposite.
       */
      toggleTheme: () => {
        const current = get().theme
        // If system mode, detect effective theme and toggle from there
        let next
        if (current === 'system') {
          const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          next = systemIsDark ? 'light' : 'dark'
        } else {
          next = current === 'light' ? 'dark' : 'light'
        }
        set({ theme: next })
        applyTheme(next)
        attachSystemListener(useThemeStore)
      },

      /**
       * Called once in main.jsx before first render.
       * Restores the persisted theme without a flash.
       */
      initTheme: () => {
        applyTheme(get().theme)
        attachSystemListener(useThemeStore)
      },
    }),
    {
      name: 'eduflow-theme',
    }
  )
)

export default useThemeStore
