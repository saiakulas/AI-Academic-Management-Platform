import { motion } from 'framer-motion'
import {
  Users, GraduationCap, BookOpen, Calendar,
  ClipboardList, Award, TrendingUp, Bell, CheckCircle2,
} from 'lucide-react'

import { dashboardApi } from '@/api/dashboard.api'
import { useQuery } from '@/hooks/useQuery'
import useAuthStore from '@/store/authStore'
import StatCard from '@/components/dashboard/StatCard'
import AttendanceChart from '@/components/dashboard/AttendanceChart'
import { SkeletonStatCard } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { formatDate, formatRelativeTime, capitalize, ROLE_COLORS } from '@/lib/utils'

// ─── Role-specific stat builders ──────────────────────────────────
function buildAdminStats(d) {
  const s = d?.stats || {}
  return [
    { title: 'Total Students',  value: s.totalStudents  ?? '—', icon: Users,        color: 'blue',    trend: 'up',     trendValue: 'Enrolled',    subtitle: 'active'       },
    { title: 'Active Teachers', value: s.totalTeachers  ?? '—', icon: GraduationCap,color: 'green',   trend: 'neutral',subtitle: 'faculty'       },
    { title: 'Total Classes',   value: s.totalClasses   ?? '—', icon: BookOpen,     color: 'purple',  trend: 'neutral',subtitle: `${s.totalSubjects ?? 0} subjects`  },
    { title: 'Attendance Today',value: `${s.todayAttendanceRate ?? 0}%`, icon: Calendar, color: 'orange', trend: s.todayAttendanceRate >= 90 ? 'up' : 'down', subtitle: 'today' },
  ]
}

function buildTeacherStats(d) {
  const s = d?.stats || {}
  return [
    { title: 'My Classes',      value: s.totalClasses    ?? '—', icon: BookOpen,     color: 'blue',   trend: 'neutral' },
    { title: 'My Students',     value: s.totalStudents   ?? '—', icon: Users,        color: 'green',  trend: 'neutral' },
    { title: 'Assignments',     value: s.totalAssignments?? '—', icon: ClipboardList,color: 'purple', trend: 'neutral' },
    { title: 'Pending Grading', value: s.pendingGrading  ?? '—', icon: Award,        color: 'orange', trend: s.pendingGrading > 0 ? 'up' : 'neutral', subtitle: 'to grade' },
  ]
}

function buildStudentStats(d) {
  const s = d?.stats || {}
  return [
    { title: 'Attendance',      value: `${s.attendancePercentage ?? 0}%`, icon: Calendar,     color: 'green',  trend: s.attendancePercentage >= 90 ? 'up' : 'down', subtitle: 'this month' },
    { title: 'Assignments Due', value: s.upcomingAssignments ?? '—',      icon: ClipboardList,color: 'blue',   trend: 'neutral', subtitle: 'upcoming'  },
    { title: 'Submitted',       value: s.submittedAssignments ?? '—',     icon: CheckCircle2, color: 'purple', trend: 'neutral', subtitle: 'this month' },
    { title: 'Present Days',    value: s.totalPresent  ?? '—',            icon: TrendingUp,   color: 'orange', trend: 'neutral', subtitle: `${s.totalAbsent ?? 0} absent` },
  ]
}

function buildParentStats(d) {
  const s = d?.stats || {}
  return [
    { title: 'Children', value: s.totalChildren ?? '—', icon: Users, color: 'blue', trend: 'neutral' },
  ]
}

// ─── Sub-components ────────────────────────────────────────────────
function NoticeCard({ notice }) {
  const PRIORITY_COLOR = { low: 'default', normal: 'primary', high: 'warning', urgent: 'danger' }
  return (
    <div className="flex gap-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-primary-50 dark:bg-primary-950/30`}>
        <Bell className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{notice.title}</p>
          <Badge variant={PRIORITY_COLOR[notice.priority] || 'default'} size="sm">{notice.priority}</Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notice.content}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeTime(notice.createdAt)}</p>
      </div>
    </div>
  )
}

function AssignmentCard({ assignment }) {
  const isOverdue = new Date(assignment.dueDate) < new Date()
  return (
    <div className="flex gap-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer">
      <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
        <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{assignment.title}</p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-gray-500">{assignment.subject?.name}</p>
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            Due {formatDate(assignment.dueDate)}
          </span>
        </div>
      </div>
    </div>
  )
}

function RecentStudentRow({ student }) {
  const user = student.user || {}
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim()
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-colors">
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

// ─── Main component ────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, loading } = useQuery(() => dashboardApi.get(), [])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const role     = user?.role || 'student'

  const statsConfig = {
    admin:   buildAdminStats,
    teacher: buildTeacherStats,
    student: buildStudentStats,
    parent:  buildParentStats,
  }
  const stats = (statsConfig[role] || buildStudentStats)(data)

  const ROLE_BADGE = {
    admin: 'purple', teacher: 'blue', student: 'success', parent: 'orange',
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in-up">
      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          : stats.map((s, i) => <StatCard key={s.title} {...s} delay={i * 0.05} />)}
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Attendance chart */}
        <div className="xl:col-span-2">
          <AttendanceChart />
        </div>

        {/* Role-specific sidebar panel */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
          {role === 'admin' && (
            <>
              <div className="px-5 py-4 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recently Enrolled</h3>
                <a href="/dashboard/students" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all</a>
              </div>
              <div className="p-3 space-y-1">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3 p-3 items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-surface-800" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-gray-100 dark:bg-surface-800 rounded w-28" />
                          <div className="h-2.5 bg-gray-100 dark:bg-surface-800 rounded w-40" />
                        </div>
                      </div>
                    ))
                  : (data?.recentStudents || []).map((s) => <RecentStudentRow key={s._id} student={s} />)}
              </div>
            </>
          )}

          {(role === 'teacher' || role === 'student') && (
            <>
              <div className="px-5 py-4 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {role === 'teacher' ? 'Recent Assignments' : 'Upcoming Assignments'}
                </h3>
                <a href="/dashboard/assignments" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all</a>
              </div>
              <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-50 dark:bg-surface-800 rounded-xl m-1" />)
                  : (data?.recentAssignments || data?.assignments || []).length === 0
                    ? <p className="text-sm text-gray-400 text-center py-6">No assignments</p>
                    : (data?.recentAssignments || data?.assignments || []).map((a) => <AssignmentCard key={a._id} assignment={a} />)}
              </div>
            </>
          )}

          {role === 'parent' && (
            <>
              <div className="px-5 py-4 border-b border-gray-100 dark:border-surface-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Children's Overview</h3>
              </div>
              <div className="p-4 space-y-3">
                {loading
                  ? <div className="h-20 bg-gray-50 dark:bg-surface-800 rounded-xl" />
                  : (data?.childStats || []).map((c) => {
                      const u = c.student?.user || {}
                      return (
                        <div key={c.student?._id} className="p-3 rounded-xl bg-gray-50 dark:bg-surface-800 space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar name={`${u.firstName} ${u.lastName}`} size="sm" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.firstName} {u.lastName}</p>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Attendance</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{c.attendance?.percentage ?? 0}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-surface-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${c.attendance?.percentage ?? 0}%` }} />
                          </div>
                        </div>
                      )
                    })}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Notices feed */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Latest Notices</h3>
          <a href="/dashboard/notices" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all</a>
        </div>
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-1">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-50 dark:bg-surface-800 rounded-xl m-1" />)
            : (data?.recentNotices || data?.notices || []).length === 0
              ? <p className="text-sm text-gray-400 text-center py-6 col-span-2">No notices available</p>
              : (data?.recentNotices || data?.notices || []).map((n) => <NoticeCard key={n._id} notice={n} />)}
        </div>
      </motion.div>
    </div>
  )
}
