import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, LayoutDashboard, Users, GraduationCap,
  BookOpen, FolderOpen, Calendar, ClipboardList,
  FileText, Bell, BarChart3, Settings, User,
  ArrowRight, Clock, Sparkles, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

// ─── All navigable commands ───────────────────────────────────────
const ALL_COMMANDS = [
  // Navigation
  { id: 'dashboard',   label: 'Dashboard',         icon: LayoutDashboard, to: '/dashboard',            group: 'Navigate', roles: ['admin','teacher','student','parent'] },
  { id: 'students',    label: 'Students',           icon: Users,           to: '/dashboard/students',   group: 'Navigate', roles: ['admin','teacher'] },
  { id: 'teachers',    label: 'Teachers',           icon: GraduationCap,   to: '/dashboard/teachers',   group: 'Navigate', roles: ['admin'] },
  { id: 'classes',     label: 'Classes',            icon: BookOpen,        to: '/dashboard/classes',    group: 'Navigate', roles: ['admin','teacher','student'] },
  { id: 'subjects',    label: 'Subjects',           icon: FolderOpen,      to: '/dashboard/subjects',   group: 'Navigate', roles: ['admin','teacher','student'] },
  { id: 'attendance',  label: 'Attendance',         icon: Calendar,        to: '/dashboard/attendance', group: 'Navigate', roles: ['admin','teacher','student','parent'] },
  { id: 'assignments', label: 'Assignments',        icon: ClipboardList,   to: '/dashboard/assignments',group: 'Navigate', roles: ['admin','teacher','student'] },
  { id: 'materials',   label: 'Study Materials',    icon: FileText,        to: '/dashboard/materials',  group: 'Navigate', roles: ['admin','teacher','student'] },
  { id: 'results',     label: 'Results',            icon: BarChart3,       to: '/dashboard/results',    group: 'Navigate', roles: ['admin','teacher','student','parent'] },
  { id: 'notices',     label: 'Notices',            icon: Bell,            to: '/dashboard/notices',    group: 'Navigate', roles: ['admin','teacher','student','parent'] },
  { id: 'profile',     label: 'My Profile',         icon: User,            to: '/dashboard/profile',    group: 'Navigate', roles: ['admin','teacher','student','parent'] },
  { id: 'settings',    label: 'Settings',           icon: Settings,        to: '/dashboard/settings',   group: 'Navigate', roles: ['admin','teacher','student','parent'] },

  // Actions
  { id: 'action-attendance', label: 'Mark Attendance',    icon: Calendar,      to: '/dashboard/attendance', group: 'Actions', roles: ['admin','teacher'], keyword: 'mark attendance today' },
  { id: 'action-assignment', label: 'Create Assignment',  icon: ClipboardList, to: '/dashboard/assignments',group: 'Actions', roles: ['admin','teacher'], keyword: 'new assignment create' },
  { id: 'action-notice',     label: 'Post a Notice',      icon: Bell,          to: '/dashboard/notices',    group: 'Actions', roles: ['admin','teacher'], keyword: 'notice post announcement' },
  { id: 'action-material',   label: 'Upload Material',    icon: FileText,      to: '/dashboard/materials',  group: 'Actions', roles: ['admin','teacher'], keyword: 'upload material pdf notes' },
  { id: 'action-result',     label: 'Publish Result',     icon: BarChart3,     to: '/dashboard/results',    group: 'Actions', roles: ['admin','teacher'], keyword: 'publish result exam grade' },
]

const RECENT_KEY = 'eduflow-cmd-recent'
const MAX_RECENT = 5

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') }
  catch { return [] }
}

function saveRecent(id) {
  try {
    const prev = getRecent().filter((r) => r !== id)
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...prev].slice(0, MAX_RECENT)))
  } catch {}
}

// ─── Highlight matching text ──────────────────────────────────────
function Highlight({ text, query }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ─── Main Command Palette ─────────────────────────────────────────
export default function CommandPalette({ open, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const [query,       setQuery]       = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef  = useRef(null)
  const listRef   = useRef(null)

  // Filter commands by role
  const roleCommands = useMemo(
    () => ALL_COMMANDS.filter((c) => c.roles.includes(user?.role)),
    [user?.role]
  )

  // Build result list based on query
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      // Show recent + suggestions
      const recent = getRecent()
      const recentCmds = recent
        .map((id) => roleCommands.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => ({ ...c, group: 'Recent' }))

      const suggested = roleCommands.filter((c) => c.group === 'Actions').slice(0, 4)
      return [...recentCmds, ...suggested]
    }

    return roleCommands.filter((c) => {
      const haystack = `${c.label} ${c.keyword || ''} ${c.group}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [query, roleCommands])

  // Group results
  const grouped = useMemo(() => {
    const map = {}
    results.forEach((r) => {
      if (!map[r.group]) map[r.group] = []
      map[r.group].push(r)
    })
    return map
  }, [results])

  // Flat list for keyboard nav
  const flat = useMemo(() => results, [results])

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const execute = useCallback((cmd) => {
    if (!cmd) return
    saveRecent(cmd.id)
    onClose()
    navigate(cmd.to)
  }, [navigate, onClose])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    const handle = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, flat.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        execute(flat[activeIndex])
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [open, flat, activeIndex, execute, onClose])

  // Reset active index when results change
  useEffect(() => { setActiveIndex(0) }, [query])

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handle = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open ? onClose() : null // opened by parent
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [open, onClose])

  let flatIndex = 0

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-surface-800">
              <Search className="h-4.5 w-4.5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, actions…"
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                autoComplete="off"
                spellCheck="false"
              />
              {query && (
                <button onClick={() => setQuery('')}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-surface-800 transition-colors">
                  Clear
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-600 font-mono">
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-surface-800 rounded border border-gray-200 dark:border-surface-700">esc</span>
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[min(420px,60vh)] overflow-y-auto py-2">
              {flat.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2 text-center">
                  <Search className="h-8 w-8 text-gray-200 dark:text-surface-700" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">No results for "<span className="text-gray-600 dark:text-gray-300">{query}</span>"</p>
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    {/* Group header */}
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                      {group === 'Recent'  && <Clock className="h-3 w-3 text-gray-400 shrink-0" />}
                      {group === 'Actions' && <Sparkles className="h-3 w-3 text-primary-500 shrink-0" />}
                      {group === 'Navigate'&& <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />}
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        {group}
                      </span>
                    </div>

                    {/* Items */}
                    {items.map((cmd) => {
                      const Icon   = cmd.icon
                      const idx    = flatIndex++
                      const isActive = idx === activeIndex
                      return (
                        <button
                          key={cmd.id}
                          data-active={isActive}
                          onClick={() => execute(cmd)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75',
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-950/30'
                              : 'hover:bg-gray-50 dark:hover:bg-surface-800/50'
                          )}
                        >
                          {/* Icon */}
                          <div className={cn(
                            'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                            isActive
                              ? 'bg-primary-100 dark:bg-primary-900/50'
                              : 'bg-gray-100 dark:bg-surface-800'
                          )}>
                            <Icon className={cn(
                              'h-4 w-4',
                              isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                            )} />
                          </div>

                          {/* Label */}
                          <div className="min-w-0 flex-1">
                            <p className={cn(
                              'text-sm font-medium truncate',
                              isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'
                            )}>
                              <Highlight text={cmd.label} query={query} />
                            </p>
                            {cmd.group !== 'Recent' && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{cmd.to}</p>
                            )}
                          </div>

                          {/* Enter hint */}
                          {isActive && (
                            <kbd className="shrink-0 text-xs text-primary-500 dark:text-primary-400 font-mono flex items-center gap-0.5">
                              <span className="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/50 rounded border border-primary-200 dark:border-primary-800">↵</span>
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-surface-800 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-surface-800 rounded text-[10px] border border-gray-200 dark:border-surface-700">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-surface-800 rounded text-[10px] border border-gray-200 dark:border-surface-700">↵</kbd>
                  Open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-surface-800 rounded text-[10px] border border-gray-200 dark:border-surface-700">esc</kbd>
                  Close
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {flat.length} result{flat.length !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
