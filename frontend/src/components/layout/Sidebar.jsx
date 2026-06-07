import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Calendar,
  FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/authStore'

const NAV_ITEMS = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', roles: ['admin', 'teacher', 'student', 'parent'] },
    ],
  },
  {
    section: 'Academics',
    items: [
      { label: 'Students', icon: Users, to: '/dashboard/students', roles: ['admin', 'teacher'] },
      { label: 'Teachers', icon: Shield, to: '/dashboard/teachers', roles: ['admin'] },
      { label: 'Classes', icon: BookOpen, to: '/dashboard/classes', roles: ['admin', 'teacher', 'student'] },
      { label: 'Subjects', icon: FolderOpen, to: '/dashboard/subjects', roles: ['admin', 'teacher', 'student'] },
    ],
  },
  {
    section: 'Activities',
    items: [
      { label: 'Attendance', icon: Calendar, to: '/dashboard/attendance', roles: ['admin', 'teacher', 'student', 'parent'] },
      { label: 'Assignments', icon: ClipboardList, to: '/dashboard/assignments', roles: ['admin', 'teacher', 'student'] },
      { label: 'Study Materials', icon: FileText, to: '/dashboard/materials', roles: ['admin', 'teacher', 'student'] },
    ],
  },
  {
    section: 'Reports',
    items: [
      { label: 'Results', icon: BarChart3, to: '/dashboard/results', roles: ['admin', 'teacher', 'student', 'parent'] },
      { label: 'Notices', icon: Bell, to: '/dashboard/notices', roles: ['admin', 'teacher', 'student', 'parent'] },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Settings', icon: Settings, to: '/dashboard/settings', roles: ['admin', 'teacher', 'student', 'parent'] },
    ],
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuthStore()
  const location = useLocation()

  const visibleItems = NAV_ITEMS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(user?.role)),
  })).filter((section) => section.items.length > 0)

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-white dark:bg-surface-900 border-r border-gray-100 dark:border-surface-800 shrink-0 overflow-hidden"
    >
      {/* ─── Logo ──────────────────────────────────────────────── */}
      <div className={cn(
        'flex items-center h-16 border-b border-gray-100 dark:border-surface-800 shrink-0',
        collapsed ? 'px-4 justify-center' : 'px-5 justify-between'
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap className="h-4.5 w-4.5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight whitespace-nowrap"
              >
                EduFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Navigation ────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {visibleItems.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                {section.section}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.to}
                  item={item}
                  collapsed={collapsed}
                  active={
                    item.to === '/dashboard'
                      ? location.pathname === '/dashboard'
                      : location.pathname.startsWith(item.to)
                  }
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ─── Collapse Toggle ───────────────────────────────────── */}
      <div className="p-2 border-t border-gray-100 dark:border-surface-800 shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center rounded-xl px-3 py-2',
            'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            'hover:bg-gray-100 dark:hover:bg-surface-800',
            'transition-colors duration-150',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}

function SidebarItem({ item, collapsed, active }) {
  const Icon = item.icon

  return (
    <li>
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          cn(
            'relative flex items-center rounded-xl px-3 py-2 text-sm font-medium',
            'transition-all duration-150 group',
            collapsed ? 'justify-center' : 'gap-3',
            isActive || active
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400 sidebar-item-active'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-800 hover:text-gray-900 dark:hover:text-gray-100'
          )
        }
        end={item.to === '/dashboard'}
      >
        <Icon className={cn('h-4.5 w-4.5 shrink-0', active && 'text-primary-600 dark:text-primary-400')} />

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Tooltip when collapsed */}
        {collapsed && (
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
            {item.label}
          </span>
        )}
      </NavLink>
    </li>
  )
}
