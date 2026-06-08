import { motion } from 'framer-motion'
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  ClipboardList,
  Calendar,
  Bell,
  Award,
  Shield,
  Eye,
} from 'lucide-react'

import useAuthStore from '@/store/authStore'
import StatCard from '@/components/dashboard/StatCard'
import RecentActivity from '@/components/dashboard/RecentActivity'
import AttendanceChart from '@/components/dashboard/AttendanceChart'
import Badge from '@/components/ui/Badge'
import { getRoleBadgeVariant, ROLE_META, formatDate } from '@/lib/utils'

// ─── Role-specific stat cards ─────────────────────────────────────────────────

const ADMIN_STATS = [
  { title: 'Total Students',   value: '1,284', icon: Users,         color: 'blue',   trend: 'up',      trendValue: '+12%', subtitle: 'vs last month' },
  { title: 'Faculty Members',  value: '64',    icon: GraduationCap, color: 'green',  trend: 'up',      trendValue: '+3',   subtitle: 'this semester' },
  { title: 'Active Classes',   value: '48',    icon: BookOpen,      color: 'purple', trend: 'neutral',                     subtitle: '12 grades' },
  { title: 'Avg. Attendance',  value: '91.4%', icon: Calendar,      color: 'orange', trend: 'up',      trendValue: '+2.1%', subtitle: 'this week' },
]

const TEACHER_STATS = [
  { title: 'My Students',   value: '156',   icon: Users,         color: 'blue',   trend: 'up',     trendValue: '+4',  subtitle: 'this month' },
  { title: 'Assignments',   value: '12',    icon: ClipboardList, color: 'purple', trend: 'neutral',                  subtitle: '3 due this week' },
  { title: 'Class Average', value: '78.2%', icon: Award,         color: 'green',  trend: 'up',     trendValue: '+5%', subtitle: 'this term' },
  { title: 'Classes Today', value: '5',     icon: Calendar,      color: 'orange', trend: 'neutral',                  subtitle: '2 remaining' },
]

const STUDENT_STATS = [
  { title: 'Attendance',    value: '94.2%', icon: Calendar,      color: 'green',  trend: 'up',  trendValue: '+1.2%', subtitle: 'this month' },
  { title: 'Assignments',   value: '8',     icon: ClipboardList, color: 'blue',   trend: 'neutral',                  subtitle: '2 pending' },
  { title: 'Overall Grade', value: 'A-',    icon: Award,         color: 'purple', trend: 'up',  trendValue: '+5pts', subtitle: 'this term' },
  { title: 'Class Rank',    value: '#7',    icon: TrendingUp,    color: 'orange', trend: 'up',  trendValue: '+3',    subtitle: 'in class' },
]

const PARENT_STATS = [
  { title: "Child's Attendance", value: '93.5%', icon: Calendar,   color: 'green',  trend: 'up',  trendValue: '+0.5%', subtitle: 'this month' },
  { title: 'Pending Assignments', value: '3',    icon: ClipboardList, color: 'blue', trend: 'neutral',                 subtitle: 'due this week' },
  { title: 'Latest Grade',        value: 'B+',   icon: Award,      color: 'purple', trend: 'up',  trendValue: '+1 grade', subtitle: 'last exam' },
  { title: 'New Notices',         value: '2',    icon: Bell,       color: 'orange', trend: 'neutral',                  subtitle: 'unread' },
]

function getStats(role) {
  switch (role) {
    case 'admin':   return ADMIN_STATS
    case 'teacher': return TEACHER_STATS
    case 'parent':  return PARENT_STATS
    default:        return STUDENT_STATS
  }
}

// ─── Role-specific greeting subtitles ────────────────────────────────────────

function getRoleSubtitle(role) {
  switch (role) {
    case 'admin':   return "Here's your institution overview for today."
    case 'teacher': return "Here's your class activity and pending tasks."
    case 'parent':  return "Here's your child's latest academic snapshot."
    default:        return "Here's your academic progress for today."
  }
}

// ─── Upcoming events (same for all roles, filtered by relevance) ─────────────

const UPCOMING_EVENTS = [
  { title: 'Math Midterm Exam',      date: 'Nov 20, 2024', type: 'exam',       roles: ['admin', 'teacher', 'student', 'parent'] },
  { title: 'Science Fair',           date: 'Nov 22, 2024', type: 'event',      roles: ['admin', 'teacher', 'student', 'parent'] },
  { title: 'Physics Assignment Due', date: 'Nov 25, 2024', type: 'assignment', roles: ['admin', 'teacher', 'student'] },
  { title: 'Parent-Teacher Meeting', date: 'Nov 28, 2024', type: 'meeting',    roles: ['admin', 'teacher', 'parent'] },
  { title: 'Faculty Board Meeting',  date: 'Nov 30, 2024', type: 'meeting',    roles: ['admin'] },
]

const EVENT_BADGE = {
  exam:       'danger',
  event:      'primary',
  assignment: 'warning',
  meeting:    'success',
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const role  = user?.role ?? 'student'
  const stats = getStats(role)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const roleMeta   = ROLE_META[role]
  const badgeVariant = getRoleBadgeVariant(role)

  // Admins see their title "Principal / Admin", others see their role label
  const roleLabel = role === 'admin' ? 'Principal' : roleMeta?.label ?? role

  const events = UPCOMING_EVENTS.filter((e) => e.roles.includes(role))

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in-up">

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {greeting}, {user?.firstName} 👋
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getRoleSubtitle(role)}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Badge variant={badgeVariant} size="lg" dot>
            {roleLabel}
          </Badge>
          <span className="text-sm text-gray-400 dark:text-gray-500 hidden sm:block">
            {formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ─── Admin institution notice ────────────────────────────── */}
      {role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50"
        >
          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">
              Administrator Access
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
              You have full institutional access. Manage faculty, enroll students, configure classes and publish announcements from the sidebar.
            </p>
          </div>
        </motion.div>
      )}

      {/* ─── Parent read-only notice ─────────────────────────────── */}
      {role === 'parent' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/50"
        >
          <Eye className="h-5 w-5 text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
              Parent / Guardian View
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
              You are viewing a read-only snapshot of your child's academic activity. Contact the school office for any changes.
            </p>
          </div>
        </motion.div>
      )}

      {/* ─── Stats Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} delay={i * 0.05} />
        ))}
      </div>

      {/* ─── Chart + Upcoming Events ────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AttendanceChart />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-surface-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Upcoming Events</h3>
            <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
              View all
            </button>
          </div>
          <div className="p-4 space-y-1.5">
            {events.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
              >
                <div className="mt-0.5">
                  <Badge variant={EVENT_BADGE[event.type]} size="sm" dot>
                    {event.type}
                  </Badge>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{event.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Recent Activity ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <RecentActivity />
      </motion.div>
    </div>
  )
}
