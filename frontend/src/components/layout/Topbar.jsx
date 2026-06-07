import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  Settings,
  User,
  ChevronDown,
  Menu,
  Shield,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

import useAuthStore from '@/store/authStore'
import useThemeStore from '@/store/themeStore'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { cn, capitalize, ROLE_COLORS } from '@/lib/utils'

const NOTIFICATIONS = [
  { id: 1, title: 'Assignment submitted', desc: 'Sarah J. submitted Math Assignment 3', time: '2m ago', read: false },
  { id: 2, title: 'New announcement', desc: 'School picnic scheduled for Friday', time: '1h ago', read: false },
  { id: 3, title: 'Grade published', desc: 'Physics mid-term grades are out', time: '3h ago', read: true },
]

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const profileRef = useRef(null)
  const notifRef = useRef(null)

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    toast.success('Logged out successfully')
    navigate('/auth/login')
  }

  return (
    <header className="h-16 bg-white dark:bg-surface-900 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between px-4 sm:px-6 shrink-0 gap-4">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2.5 h-9 px-3.5 rounded-xl bg-gray-100 dark:bg-surface-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Search anything...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono text-gray-400 bg-gray-200 dark:bg-surface-700 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative h-9 w-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-surface-900" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <NotificationDropdown
                notifications={NOTIFICATIONS}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 dark:bg-surface-700 mx-1" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2.5 h-9 pl-1 pr-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors"
          >
            <Avatar name={user?.fullName || `${user?.firstName} ${user?.lastName}`} size="sm" src={user?.avatar} />
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none truncate max-w-[100px]">
                {user?.firstName}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize leading-none mt-0.5">
                {user?.role}
              </p>
            </div>
            <ChevronDown className={cn('h-3.5 w-3.5 text-gray-400 transition-transform hidden sm:block', profileOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <ProfileDropdown
                user={user}
                onNavigate={(to) => { setProfileOpen(false); navigate(to) }}
                onLogout={handleLogout}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

function NotificationDropdown({ notifications, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 shadow-lg shadow-gray-200/50 dark:shadow-black/30 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-surface-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
        <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
          Mark all read
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-surface-800">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              'flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-surface-800 cursor-pointer transition-colors',
              !n.read && 'bg-primary-50/50 dark:bg-primary-950/20'
            )}
          >
            <div className={cn('h-2 w-2 rounded-full mt-1.5 shrink-0', !n.read ? 'bg-primary-500' : 'bg-transparent')} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{n.desc}</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-surface-800">
        <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          View all notifications →
        </button>
      </div>
    </motion.div>
  )
}

function ProfileDropdown({ user, onNavigate, onLogout }) {
  const fullName = user ? `${user.firstName} ${user.lastName}` : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 shadow-lg shadow-gray-200/50 dark:shadow-black/30 z-50 overflow-hidden"
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-surface-800">
        <div className="flex items-center gap-3">
          <Avatar name={fullName} size="md" src={user?.avatar} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{fullName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            <Badge variant="primary" size="sm" className="mt-1.5">
              {capitalize(user?.role)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-1.5">
        <DropdownItem icon={User} label="My Profile" onClick={() => onNavigate('/dashboard/profile')} />
        <DropdownItem icon={Settings} label="Settings" onClick={() => onNavigate('/dashboard/settings')} />
      </div>

      <div className="p-1.5 border-t border-gray-100 dark:border-surface-800">
        <DropdownItem
          icon={LogOut}
          label="Sign out"
          onClick={onLogout}
          danger
        />
      </div>
    </motion.div>
  )
}

function DropdownItem({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm',
        'transition-colors duration-100',
        danger
          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-800'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  )
}
