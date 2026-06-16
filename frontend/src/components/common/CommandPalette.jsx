import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, LayoutDashboard, Users, GraduationCap,
  BookOpen, FolderOpen, Calendar, ClipboardList,
  FileText, Bell, BarChart3, Settings, User,
  ArrowRight, Clock, Zap, Hash, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/authStore'

// ─── Command registry ─────────────────────────────────────────────
const ALL_COMMANDS = [
  { id: 'dashboard',        label: 'Dashboard',          desc: 'Overview & analytics',         icon: LayoutDashboard, to: '/dashboard',             group: 'Pages',   roles: ['admin','teacher','student','parent'], color: 'from-violet-500 to-indigo-500' },
  { id: 'students',         label: 'Students',           desc: 'Manage enrollments',            icon: Users,           to: '/dashboard/students',    group: 'Pages',   roles: ['admin','teacher'],                   color: 'from-blue-500 to-cyan-500' },
  { id: 'teachers',         label: 'Teachers',           desc: 'Faculty management',            icon: GraduationCap,   to: '/dashboard/teachers',    group: 'Pages',   roles: ['admin'],                             color: 'from-emerald-500 to-teal-500' },
  { id: 'classes',          label: 'Classes',            desc: 'Sections & schedules',          icon: BookOpen,        to: '/dashboard/classes',     group: 'Pages',   roles: ['admin','teacher','student'],          color: 'from-purple-500 to-violet-500' },
  { id: 'subjects',         label: 'Subjects',           desc: 'Curriculum subjects',           icon: FolderOpen,      to: '/dashboard/subjects',    group: 'Pages',   roles: ['admin','teacher','student'],          color: 'from-pink-500 to-rose-500' },
  { id: 'attendance',       label: 'Attendance',         desc: 'Track & mark attendance',       icon: Calendar,        to: '/dashboard/attendance',  group: 'Pages',   roles: ['admin','teacher','student','parent'], color: 'from-orange-500 to-amber-500' },
  { id: 'assignments',      label: 'Assignments',        desc: 'Tasks & submissions',           icon: ClipboardList,   to: '/dashboard/assignments', group: 'Pages',   roles: ['admin','teacher','student'],          color: 'from-blue-500 to-indigo-500' },
  { id: 'materials',        label: 'Study Materials',    desc: 'Notes, PDFs & resources',       icon: FileText,        to: '/dashboard/materials',   group: 'Pages',   roles: ['admin','teacher','student'],          color: 'from-teal-500 to-green-500' },
  { id: 'results',          label: 'Results',            desc: 'Exam results & performance',    icon: BarChart3,       to: '/dashboard/results',     group: 'Pages',   roles: ['admin','teacher','student','parent'], color: 'from-amber-500 to-yellow-500' },
  { id: 'notices',          label: 'Notices',            desc: 'Announcements & circulars',     icon: Bell,            to: '/dashboard/notices',     group: 'Pages',   roles: ['admin','teacher','student','parent'], color: 'from-red-500 to-pink-500' },
  { id: 'profile',          label: 'My Profile',         desc: 'Personal information',          icon: User,            to: '/dashboard/profile',     group: 'Pages',   roles: ['admin','teacher','student','parent'], color: 'from-slate-500 to-gray-500' },
  { id: 'settings',         label: 'Settings',           desc: 'Preferences & security',        icon: Settings,        to: '/dashboard/settings',    group: 'Pages',   roles: ['admin','teacher','student','parent'], color: 'from-gray-500 to-slate-500' },

  // Quick actions
  { id: 'act-attendance',   label: 'Mark Attendance',    desc: 'Record today\'s attendance',    icon: Calendar,        to: '/dashboard/attendance',  group: 'Actions', roles: ['admin','teacher'],                   color: 'from-blue-500 to-cyan-500',   keyword: 'mark today present absent' },
  { id: 'act-assignment',   label: 'Create Assignment',  desc: 'Post a new assignment',         icon: ClipboardList,   to: '/dashboard/assignments', group: 'Actions', roles: ['admin','teacher'],                   color: 'from-purple-500 to-indigo-500',keyword: 'new create task homework' },
  { id: 'act-notice',       label: 'Post a Notice',      desc: 'Broadcast announcement',        icon: Bell,            to: '/dashboard/notices',     group: 'Actions', roles: ['admin','teacher'],                   color: 'from-rose-500 to-pink-500',   keyword: 'announce post circular' },
  { id: 'act-material',     label: 'Upload Material',    desc: 'Share notes or PDFs',           icon: FileText,        to: '/dashboard/materials',   group: 'Actions', roles: ['admin','teacher'],                   color: 'from-teal-500 to-emerald-500',keyword: 'upload pdf notes share' },
  { id: 'act-result',       label: 'Publish Result',     desc: 'Publish exam results',          icon: BarChart3,       to: '/dashboard/results',     group: 'Actions', roles: ['admin','teacher'],                   color: 'from-amber-500 to-orange-500',keyword: 'publish grade exam result' },
]

const RECENT_KEY = 'eduflow-cmd-recent'
const MAX_RECENT = 5

function getRecent()  {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function pushRecent(id) {
  try {
    const prev = getRecent().filter((r) => r !== id)
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...prev].slice(0, MAX_RECENT)))
  } catch {}
}

// ─── Highlighted text ─────────────────────────────────────────────
function Highlight({ text, query }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary-600 dark:text-primary-400 font-semibold">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  )
}

// ─── Group header ─────────────────────────────────────────────────
const GROUP_META = {
  Recent:  { icon: Clock, label: 'Recent',        color: 'text-gray-400 dark:text-gray-500' },
  Actions: { icon: Zap,   label: 'Quick Actions', color: 'text-amber-500 dark:text-amber-400' },
  Pages:   { icon: Hash,  label: 'Pages',         color: 'text-primary-500 dark:text-primary-400' },
}

// ─── Main component ───────────────────────────────────────────────
export default function CommandPalette({ open, onClose }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [query,       setQuery]       = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef  = useRef(null)

  // Filter by role
  const roleCommands = useMemo(
    () => ALL_COMMANDS.filter((c) => c.roles.includes(user?.role)),
    [user?.role]
  )

  // Build displayed list
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      const recentIds = getRecent()
      const recentCmds = recentIds
        .map((id) => roleCommands.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => ({ ...c, group: 'Recent' }))
      const actions = roleCommands.filter((c) => c.group === 'Actions').slice(0, 4)
      return [...recentCmds, ...actions]
    }
    return roleCommands.filter((c) =>
      `${c.label} ${c.desc || ''} ${c.keyword || ''} ${c.group}`.toLowerCase().includes(q)
    )
  }, [query, roleCommands])

  // Group
  const grouped = useMemo(() => {
    const map = {}
    results.forEach((r) => {
      if (!map[r.group]) map[r.group] = []
      map[r.group].push(r)
    })
    return map
  }, [results])

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const execute = useCallback((cmd) => {
    if (!cmd) return
    pushRecent(cmd.id)
    onClose()
    navigate(cmd.to)
  }, [navigate, onClose])

  // Keyboard nav
  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)) }
      if (e.key === 'ArrowUp')    { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
      if (e.key === 'Enter')      { e.preventDefault(); execute(results[activeIndex]) }
      if (e.key === 'Escape')     { onClose() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, results, activeIndex, execute, onClose])

  useEffect(() => { setActiveIndex(0) }, [query])

  let flatIdx = 0

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[10vh]">

          {/* ── Backdrop with blur ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          />

          {/* ── Panel ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -16 }}
            animate={{ opacity: 1, scale: 1,    y: 0    }}
            exit={{   opacity: 0, scale: 0.94, y: -16   }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[560px] overflow-hidden rounded-2xl shadow-2xl shadow-black/30"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
            }}
          >
            {/* Dark mode override */}
            <div className="dark:hidden absolute inset-0 rounded-2xl ring-1 ring-gray-200/80 pointer-events-none" />
            <div className="hidden dark:block absolute inset-0 rounded-2xl bg-surface-900/95 ring-1 ring-white/10 pointer-events-none" />

            {/* Top gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-violet-500 to-pink-500 z-10" />

            {/* ── Search input ──────────────────────────────────── */}
            <div className="relative flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-white/5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shrink-0 shadow-sm">
                <Search className="h-4 w-4 text-white" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, actions, commands…"
                className="flex-1 bg-transparent text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none font-medium"
                autoComplete="off"
                spellCheck="false"
              />
              <div className="flex items-center gap-2 shrink-0">
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setQuery('')}
                    className="h-6 w-6 flex items-center justify-center rounded-md bg-gray-100 dark:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
                <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded border border-gray-200 dark:border-white/10 leading-none">ESC</span>
                </kbd>
              </div>
            </div>

            {/* ── Results ───────────────────────────────────────── */}
            <div ref={listRef} className="overflow-y-auto max-h-[min(400px,55vh)] py-2">
              {results.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                    <Search className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No results for "<span className="text-gray-700 dark:text-gray-300 font-medium">{query}</span>"
                  </p>
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => {
                  const meta = GROUP_META[group] || GROUP_META.Pages
                  const GroupIcon = meta.icon
                  return (
                    <div key={group} className="mb-1">
                      {/* Group label */}
                      <div className="flex items-center gap-1.5 px-4 pt-2 pb-1.5">
                        <GroupIcon className={cn('h-3 w-3 shrink-0', meta.color)} />
                        <span className={cn('text-[10px] font-bold uppercase tracking-widest', meta.color)}>
                          {meta.label}
                        </span>
                      </div>

                      {/* Items */}
                      {items.map((cmd) => {
                        const Icon    = cmd.icon
                        const idx     = flatIdx++
                        const isActive= idx === activeIndex

                        return (
                          <motion.button
                            key={cmd.id}
                            data-active={isActive}
                            onClick={() => execute(cmd)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            initial={false}
                            animate={{
                              backgroundColor: isActive
                                ? 'rgba(99, 102, 241, 0.06)'
                                : 'rgba(0,0,0,0)',
                            }}
                            transition={{ duration: 0.1 }}
                            className="w-full flex items-center gap-3 px-3 mx-1 py-2.5 rounded-xl text-left group"
                            style={{ width: 'calc(100% - 8px)' }}
                          >
                            {/* Gradient icon */}
                            <div className={cn(
                              'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150',
                              isActive
                                ? `bg-gradient-to-br ${cmd.color} shadow-lg`
                                : 'bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10'
                            )}>
                              <Icon className={cn(
                                'h-4 w-4 transition-colors duration-150',
                                isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                              )} />
                            </div>

                            {/* Text */}
                            <div className="min-w-0 flex-1">
                              <p className={cn(
                                'text-sm font-semibold leading-none truncate transition-colors',
                                isActive
                                  ? 'text-primary-700 dark:text-primary-300'
                                  : 'text-gray-800 dark:text-gray-200'
                              )}>
                                <Highlight text={cmd.label} query={query} />
                              </p>
                              <p className={cn(
                                'text-xs mt-0.5 truncate transition-colors',
                                isActive
                                  ? 'text-primary-500/70 dark:text-primary-400/70'
                                  : 'text-gray-400 dark:text-gray-500'
                              )}>
                                {cmd.desc}
                              </p>
                            </div>

                            {/* Active enter hint */}
                            <AnimatePresence>
                              {isActive && (
                                <motion.div
                                  initial={{ opacity: 0, x: 4 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 4 }}
                                  transition={{ duration: 0.1 }}
                                  className="shrink-0 flex items-center gap-1"
                                >
                                  <span className="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-[10px] font-bold rounded border border-primary-200 dark:border-primary-700/50 font-mono">
                                    ↵
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            {/* ── Footer ────────────────────────────────────────── */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {[
                  { keys: ['↑', '↓'], label: 'Navigate' },
                  { keys: ['↵'],      label: 'Open'     },
                  { keys: ['ESC'],    label: 'Close'    },
                ].map(({ keys, label }) => (
                  <div key={label} className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                    {keys.map((k) => (
                      <kbd key={k} className="px-1 py-0.5 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded text-[10px] font-mono leading-none">
                        {k}
                      </kbd>
                    ))}
                    <span className="ml-0.5">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] text-gray-300 dark:text-gray-600">·</span>
                <span className="text-[10px] font-semibold text-primary-500 dark:text-primary-400">EduFlow</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
