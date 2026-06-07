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
} from 'lucide-react'

import useAuthStore from '@/store/authStore'
import StatCard from '@/components/dashboard/StatCard'
import RecentActivity from '@/components/dashboard/RecentActivity'
import AttendanceChart from '@/components/dashboard/AttendanceChart'
import Badge from '@/components/ui/Badge'
import { ROLE_COLORS, capitalize, formatDate } from '@/lib/utils'

const ADMIN_STATS = [
  { title: 'Total Students', value: '1,284', icon: Users, color: 'blue', trend: 'up', trendValue: '+12%', subtitle: 'vs last month' },
  { title: 'Active Teachers', value: '64', icon: GraduationCap, color: 'green', trend: 'up', trendValue: '+3', subtitle: 'this semester' },
  { title: 'Total Classes', value: '48', icon: BookOpen, color: 'purple', trend: 'neutral', subtitle: '12 grades' },
  { title: 'Avg. Attendance', value: '91.4%', icon: Calendar, color: 'orange', trend: 'up', trendValue: '+2.1%', subtitle: 'this week' },
]

const TEACHER_STATS = [
  { title: 'My Students', value: '156', icon: Users, color: 'blue', trend: 'up', trendValue: '+4', subtitle: 'this month' },
  { title: 'Assignments', value: '12', icon: ClipboardList, color: 'purple', trend: 'neutral', subtitle: '3 due this week' },
  { title: 'Avg. Score', value: '78.2%', icon: Award, color: 'green', trend: 'up', trendValue: '+5%', subtitle: 'class average' },
  { title: 'Classes Today', value: '5', icon: Calendar, color: 'orange', trend: 'neutral', subtitle: '2 remaining' },
]

const STUDENT_STATS = [
  { title: 'Attendance', value: '94.2%', icon: Calendar, color: 'green', trend: 'up', trendValue: '+1.2%', subtitle: 'this month' },
  { title: 'Assignments', value: '8', icon: ClipboardList, color: 'blue', trend: 'neutral', subtitle: '2 pending' },
  { title: 'Overall Grade', value: 'A-', icon: Award, color: 'purple', trend: 'up', trendValue: '+5pts', subtitle: 'this term' },
  { title: 'Rank', value: '#7', icon: TrendingUp, color: 'orange', trend: 'up', trendValue: '+3', subtitle: 'in class' },
]

function getStats(role) {
  if (role === 'admin') return ADMIN_STATS
  if (role === 'teacher') return TEACHER_STATS
  return STUDENT_STATS
}

const UPCOMING_EVENTS = [
  { title: 'Math Midterm Exam', date: 'Nov 20, 2024', type: 'exam' },
  { title: 'Science Fair', date: 'Nov 22, 2024', type: 'event' },
  { title: 'Physics Assignment Due', date: 'Nov 25, 2024', type: 'assignment' },
  { title: 'Parent-Teacher Meeting', date: 'Nov 28, 2024', type: 'meeting' },
]

const EVENT_COLORS = {
  exam: 'danger',
  event: 'primary',
  assignment: 'warning',
  meeting: 'success',
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const stats = getStats(user?.role)
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in-up">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening in your institution today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={user?.role === 'admin' ? 'purple' : user?.role === 'teacher' ? 'blue' : user?.role === 'parent' ? 'orange' : 'success'} size="lg" dot>
            {capitalize(user?.role || 'student')}
          </Badge>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ─── Stats Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} delay={i * 0.05} />
        ))}
      </div>

      {/* ─── Charts + Activity ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AttendanceChart />
        </div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-surface-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Upcoming Events</h3>
            <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
              View calendar
            </button>
          </div>
          <div className="p-4 space-y-2">
            {UPCOMING_EVENTS.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
              >
                <div className="mt-1">
                  <Badge variant={EVENT_COLORS[event.type]} size="sm" dot>
                    {event.type}
                  </Badge>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.date}</p>
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
