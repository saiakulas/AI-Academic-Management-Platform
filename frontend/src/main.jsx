import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import useThemeStore from './store/themeStore'

// Apply saved theme synchronously before first paint — prevents flash
useThemeStore.getState().initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode intentionally double-invokes effects in development.
  // We disable it here since our auth flow is effect-driven and
  // StrictMode would cause duplicate /auth/me network calls.
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--toast-bg, #fff)',
          color:      'var(--toast-color, #111827)',
          borderRadius: '12px',
          border:     '1px solid var(--toast-border, #e5e7eb)',
          fontSize:   '14px',
          fontWeight: '500',
          boxShadow:  '0 4px 16px rgba(0,0,0,0.08)',
          padding:    '12px 16px',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  </BrowserRouter>
)
