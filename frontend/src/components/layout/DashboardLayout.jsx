import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { cn } from '@/lib/utils'

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-surface-950">
      {/* ─── Desktop Sidebar ─────────────────────────────────────── */}
      <div className="hidden lg:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      {/* ─── Mobile Sidebar Overlay ──────────────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <Sidebar
                collapsed={false}
                onToggle={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setMobileSidebarOpen((v) => !v)} />

        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
