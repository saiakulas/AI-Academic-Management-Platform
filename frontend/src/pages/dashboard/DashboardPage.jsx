import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users, GraduationCap, BookOpen, Calendar,
  ClipboardList, Award, TrendingUp, Bell, CheckCircle2,
  UserPlus, Plus, ClipboardCheck, Megaphone, ArrowRight,
} from 'lucide-react'

import { dashboardApi } from '@/api/dashboard.api'
import { useQuery } from '@/hooks/useQuery'
import useAuthStore from '@/store/authStore'
import StatCard from '@/components/dashboard/StatCard'
import AttendanceChart from '@/components/dashboard/AttendanceChart'
import { SkeletonStatCard } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { formatDate, formatRelativeTime, capitalize } from '@/lib/utils'

// ─── Role-specific stat builders ──────────────────────────────────
function buildAdminStats(d) {
  const s = d?.stats || {}
  return [
    { title: 'Total Students',  value: s.totalStudents  ?? '—', icon: Users,        color: 'blue',   trend: 'up',      trendValue: 'Enrolled', subtitle: 'active'                    },
    { title: 'Active Teachers', value: s.totalTeachers  ?? '—', icon: GraduationCap,color: 'green',  trend: 'neutral', subtitle: 'faculty'                                           },
    { title: 'Total Classes',   value: s.totalClasses   ?? '—', icon: BookOpen,     color: 'purple', trend: 'neutral', subtitle: `${s.totalSubjects ?? 0} subjects`                  },
    { title: 'Attendance Today',value: `${s.todayAttendanceRate ?? 0}%`, icon: Calendar, color: 'orange', trend: s.todayAttendanceRate >= 90 ? 'up' : 'down', subtitle: 'today' },
  ]
}

function buildTeacherStats(d) {
  const s = d?.stats || {}
  return [
    { title: 'My Classes',      value: s.totalClasses     ?? '—', icon: BookOpen,     color: 'blue',   trend: 'neutral' },
    { title: 'My Students',     value: s.totalStudents    ?? '—', icon: Users,        color: 'green',  trend: 'neutral' },
    { title: 'Assignments',     value: s.totalAssignments ?? '—', icon: ClipboardList,color: 'purple', trend: 'neutral' },
    { title: 'Pending Grading', value: s.pendingGrading   ?? '—', icon: Award,        color: 'orange', trend: s.pendingGrading > 0 ? 'up' : 'neutral', subtitle: 'to grade' },
  ]
}

function buildStudentStats(d) {
  const s = d?.stats || {}
  return [
    { title: 'Attendance',      value: `${s.attendancePercentage ?? 0}%`, icon: Calendar,     color: 'green',  trend: s.attendancePercentage >= 90 ? 'up' : 'down', subtitle: 'this month' },
    { title: 'Assignments Due', value: s.upcomingAssignments ?? '—',      icon: ClipboardList,color: 'blue',   trend: 'neutral', subtitle: 'upcoming'   },
    { title: 'Submitted',       value: s.submittedAssignments ?? '—',     icon: CheckCircle2, color: 'purple', trend: 'neutral', subtitle: 'this month' },
    { title: 'Present Days',    value: s.totalPresent ?? '—',             icon: TrendingUp,   color: 'orange', trend: 'neutral', subtitle: `${s.totalAbsent ?? 0} absent` },
  ]
}

function buildParentStats(d) {
  const s = d?.stats || {}
  return [
    { title: 'Children Enrolled', value: s.totalChildren ?? '—', icon: Users, color: 'blue', trend: 'neutral' },
  ]
}

// ─── Quick actions per role ────────────────────────────────────────
const QUICK_ACTIONS = {
  admin: [
    { label: 'Add Student',    icon: UserPlus,       to: '/dashboard/students',   color: 'bg-blue-500' },
    { label: 'Add Teacher',    icon: GraduationCap,  to: '/dashboard/teachers',   color: 'bg-emerald-500' },
    { label: 'Post Notice',    icon: Megaphone,       to: '/dashboard/notices',    color: 'bg-purple-500' },
    { label: 'View Attendance',icon: ClipboardCheck, to: '/dashboard/attendance', color: 'bg-orange-500' },
  ],
  teacher: [
    { label: 'Mark Attendance', icon: ClipboardCheck, to: '/dashboard/attendance',  color: 'bg-blue-500' },
    { label: 'New Assignment',  icon: Plus,            to: '/dashboard/assignments', color: 'bg-purple-500' },
    { label: 'Upload Material', icon: BookOpen,        to: '/dashboard/materials',   color: 'bg-emerald-500' },
    { label: 'Post Notice',     icon: Megaphone,       to: '/dashboard/notices',     color: 'bg-orange-500' },
  ],
  student: [
    { label: 'Assignments',    icon: ClipboardList, to: '/dashboard/assignments', color: 'bg-blue-500' },
    { label: 'Study Materials',icon: BookOpen,      to: '/dashboard/materials',   color: 'bg-purple-500' },
    { label: 'My Results',     icon: Award,         to: '/dashboard/results',     color: 'bg-emerald-500' },
    { label: 'Attendance',     icon: Calendar,      to: '/dashboard/attendance',  color: 'bg-orange-500' },
  ],
  parent: [
    { label: 'Attendance',  icon: Calendar,      to: '/dashboard/attendance', color: 'bg-blue-500' },
    { label: 'Results',     icon: Award,         to: '/dashboard/results',    color: 'bg-purple-500' },
    { label: 'Notices',     icon: Bell,          to: '/dashboard/notices',    color: 'bg-emerald-500' },
  ],
}

// ─── Sub-components ───────────────────────────────────────────────
const PRIORITY_COLOR = { low: 'default', normal: 'primary', high: 'warning', urgent: 'danger' }

function NoticeCard({ notice }) {
  return (
    <Link to="/dashboard/notices"
      className="flex gap-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-colors group">
      <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-primary-50 dark:bg-primary-950/30">
        <Bell className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {notice.title}
          </p>
          <Badge variant={PRIORITY_COLOR[notice.priority] || 'default'} size="sm">{notice.priority}</Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notice.content}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeTime(notice.createdAt)}</p>
      </div>
    </Link>
  )
}

function AssignmentCard({ assignment }) {
  const isOverdue = new Date(assignment.dueDate) < new Date()
  return (
    <Link to="/dashboard/assignments"
      className="flex gap-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-colors group">
      <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
        <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {assignment.title}
        </p>
        <div className="flex items-center justify-between mt-0.5 gap-2">
          <p className="text-xs text-gray-500 truncate">{assignment.subject?.name}</p>
          <span className={`text-xs font-medium shrink-0 ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {isOverdue ? '⚠ ' : ''}Due {formatDate(assignment.dueDate)}
          </span>
        </div>
      </div>
    </Link>
  )
}

function RecentStudentRow({ student }) {
  const user = student.user || {}
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim()
  return (
    <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-colors">
      <Avatar name={name} src={user.avatar} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
      </div>
      {student.currentClass && (
        <Badge variant="blue" size="sm">G{student.currentClass.grade}-{student.currentClass.section}</Badge>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, loading } = useQuery(() => dashboardApi.get(), [])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const role     = user?.role || 'student'

  const statsConfig = { admin: buildAdminStats, teacher: buildTeacherStats, student: buildStudentStats, parent: buildParentStats }
  const stats       = (statsConfig[role] || buildStudentStats)(data)
  const quickActions= QUICK_ACTIONS[role] || []

  const ROLE_BADGE = { admin: 'purple', teacher: 'blue', student: 'success', parent: 'orange' }

  // Extract weekly attendance trend for the chart
  const weeklyData = data?.attendanceTrend || []

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in-up">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Badge variant={ROLE_BADGE[role] || 'default'} size="lg" dot>
          {capitalize(role)}
        </Badge>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────── */}
      {quickActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {quickActions.map((action, i) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
              <Link
                  to={action.to}
                  className="flex items-center gap-3 p-3.5 bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 hover:shadow-md hover:border-gray-200 dark:hover:border-surface-700 transition-all group"
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${action.color} bg-opacity-15`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-1 min-w-0 truncate">
                    {action.label}
                  </p>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          : stats.map((s, i) => <StatCard key={s.title} {...s} delay={i * 0.05} />)}
      </div>

      {/* ── Chart + Side panel ───────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {/* Pass real weekly data from API */}
          <AttendanceChart weeklyData={weeklyData} loading={loading} />
        </div>

        {/* Role-specific side panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden flex flex-col"
        >
          {role === 'admin' && (
            <>
              <div className="px-5 py-4 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recently Enrolled</h3>
                <Link to="/dashboard/students" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3 p-3 items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-surface-800 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-gray-100 dark:bg-surface-800 rounded w-28" />
                          <div className="h-2.5 bg-gray-100 dark:bg-surface-800 rounded w-40" />
                        </div>
                      </div>
                    ))
                  : (data?.recentStudents || []).length === 0
                    ? <p className="text-sm text-gray-400 text-center py-8">No recent enrollments</p>
                    : (data?.recentStudents || []).map((s) => <RecentStudentRow key={s._id} student={s} />)}
              </div>
            </>
          )}

          {(role === 'teacher' || role === 'student') && (
            <>
              <div className="px-5 py-4 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {role === 'teacher' ? 'Recent Assignments' : 'Upcoming Assignments'}
                </h3>
                <Link to="/dashboard/assignments" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-72">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-50 dark:bg-surface-800 rounded-xl m-1" />)
                  : (data?.recentAssignments || data?.assignments || []).length === 0
                    ? <p className="text-sm text-gray-400 text-center py-8">No assignments</p>
                    : (data?.recentAssignments || data?.assignments || []).map((a) => <AssignmentCard key={a._id} assignment={a} />)}
              </div>
            </>
          )}

          {role === 'parent' && (
            <>
              <div className="px-5 py-4 border-b border-gray-100 dark:border-surface-800 shrink-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Children's Overview</h3>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {loading
                  ? <div className="h-20 bg-gray-50 dark:bg-surface-800 rounded-xl" />
                  : (data?.childStats || []).map((c) => {
                      const u = c.student?.user || {}
                      const pct = c.attendance?.percentage ?? 0
                      const color = pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-amber-500' : 'bg-red-500'
                      return (
                        <div key={c.student?._id} className="p-3.5 rounded-xl bg-gray-50 dark:bg-surface-800 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={`${u.firstName} ${u.lastName}`} size="sm" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{u.firstName} {u.lastName}</p>
                              {c.student?.currentClass && (
                                <p className="text-xs text-gray-500">Grade {c.student.currentClass.grade}-{c.student.currentClass.section}</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Attendance this month</span>
                              <span className={`font-bold ${pct >= 90 ? 'text-emerald-600' : pct >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                                {pct}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-surface-700 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full ${color} rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ── Notices feed ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Latest Notices</h3>
          </div>
          <Link to="/dashboard/notices" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-1">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-50 dark:bg-surface-800 rounded-xl m-1" />)
            : (data?.recentNotices || data?.notices || []).length === 0
              ? <p className="text-sm text-gray-400 text-center py-8 col-span-2">No notices available</p>
              : (data?.recentNotices || data?.notices || []).map((n) => <NoticeCard key={n._id} notice={n} />)}
        </div>
      </motion.div>
    </div>
  )
}
