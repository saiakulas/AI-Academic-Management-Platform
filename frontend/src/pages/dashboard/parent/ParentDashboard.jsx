import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users, Calendar, BarChart3, Bell, ClipboardList,
  TrendingUp, TrendingDown, Minus, BookOpen, ArrowRight,
  CheckCircle2, AlertCircle, Clock,
} from 'lucide-react'

import { dashboardApi } from '@/api/dashboard.api'
import { useQuery } from '@/hooks/useQuery'
import useAuthStore from '@/store/authStore'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ─── Attendance ring ──────────────────────────────────────────────
function AttendanceRing({ pct }) {
  const radius    = 28
  const circumference = 2 * Math.PI * radius
  const dash      = (pct / 100) * circumference
  const color     = pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        {/* Track */}
        <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor"
          strokeWidth="6" className="text-gray-100 dark:text-surface-700" />
        {/* Progress */}
        <circle cx="36" cy="36" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>
        {pct}%
      </span>
    </div>
  )
}

// ─── Result badge ─────────────────────────────────────────────────
function ResultBadge({ percentage }) {
  if (percentage === null || percentage === undefined)
    return <span className="text-xs text-gray-400">No result yet</span>

  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' :
                percentage >= 60 ? 'B'  : percentage >= 50 ? 'C' : percentage >= 40 ? 'D' : 'F'
  const variant = percentage >= 80 ? 'success' : percentage >= 60 ? 'primary' : percentage >= 40 ? 'warning' : 'danger'

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant} size="md">{grade}</Badge>
      <span className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</span>
    </div>
  )
}

// ─── Assignment due chip ──────────────────────────────────────────
function DueChip({ dueDate }) {
  const now    = new Date()
  const due    = new Date(dueDate)
  const diff   = Math.ceil((due - now) / 86400000)
  const isLate = diff < 0

  return (
    <span className={cn(
      'text-xs font-medium flex items-center gap-1 shrink-0',
      isLate           ? 'text-red-500'
      : diff === 0     ? 'text-amber-600 dark:text-amber-400'
      : diff <= 2      ? 'text-amber-500'
      : 'text-gray-400 dark:text-gray-500'
    )}>
      {isLate        ? <AlertCircle className="h-3 w-3" />
       : diff <= 2   ? <Clock className="h-3 w-3" />
       : null}
      {isLate ? 'Overdue' : diff === 0 ? 'Due today' : `${diff}d left`}
    </span>
  )
}

// ─── Child card ───────────────────────────────────────────────────
function ChildCard({ childStat, index }) {
  const { student, attendance, upcomingAssignments, latestResult } = childStat
  const u   = student?.user || {}
  const cls = student?.currentClass
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim()
  const pct = attendance?.percentage ?? 0

  const trendIcon = (attendance?.present ?? 0) >= (attendance?.total ?? 0) * 0.9
    ? <TrendingUp className="h-3 w-3 text-emerald-500" />
    : <TrendingDown className="h-3 w-3 text-red-500" />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden hover:shadow-lg hover:border-gray-200 dark:hover:border-surface-700 transition-all"
    >
      {/* ── Child header ──────────────────────────────────────── */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar + attendance ring */}
          <div className="relative shrink-0">
            <Avatar name={name} src={u.avatar} size="xl" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{u.email}</p>
            {cls && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="blue" size="sm">
                  Grade {cls.grade}-{cls.section}
                </Badge>
                <Badge variant="default" size="sm">{cls.academicYear}</Badge>
              </div>
            )}
          </div>

          {/* Attendance ring */}
          <AttendanceRing pct={pct} />
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-surface-800 border-t border-gray-100 dark:border-surface-800">
        {[
          { label: 'Present',  value: attendance?.present  ?? 0, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Absent',   value: attendance?.absent   ?? 0, icon: AlertCircle,  color: 'text-red-500'                          },
          { label: 'Late',     value: attendance?.late     ?? 0, icon: Clock,        color: 'text-amber-500'                        },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex flex-col items-center py-3 gap-1">
            <Icon className={cn('h-4 w-4', color)} />
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">{value}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Latest result ─────────────────────────────────────── */}
      {latestResult && (
        <div className="px-5 py-3.5 border-t border-gray-100 dark:border-surface-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold">Latest Result</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 capitalize">
              {latestResult.examName || latestResult.examType} · {latestResult.academicYear}
            </p>
          </div>
          <ResultBadge percentage={latestResult.percentage} />
        </div>
      )}

      {/* ── Upcoming assignments ──────────────────────────────── */}
      {upcomingAssignments?.length > 0 && (
        <div className="px-5 pb-4 border-t border-gray-100 dark:border-surface-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold pt-3 pb-2">
            Upcoming Assignments ({upcomingAssignments.length})
          </p>
          <div className="space-y-2">
            {upcomingAssignments.slice(0, 3).map((a) => (
              <div key={a._id} className="flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-700 dark:text-gray-300 truncate">{a.title}</p>
                  {a.subject && <p className="text-gray-400 truncate">{a.subject.name}</p>}
                </div>
                <DueChip dueDate={a.dueDate} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── View full profile link ─────────────────────────────── */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-surface-800/50 border-t border-gray-100 dark:border-surface-800 flex items-center justify-between">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          This month's data
        </span>
        <Link to="/dashboard/results"
          className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
          View results <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────
export default function ParentDashboard() {
  const { user } = useAuthStore()
  const { data, loading } = useQuery(() => dashboardApi.get(), [])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const childStats = data?.childStats || []
  const notices    = data?.recentNotices || data?.notices || []

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in-up">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here's your children's academic overview for{' '}
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Badge variant="orange" size="lg" dot>Parent</Badge>
      </div>

      {/* ── Quick stats row ──────────────────────────────────────── */}
      {!loading && childStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Children',       value: childStats.length,                                                                         color: 'bg-blue-50 dark:bg-blue-950/30',   text: 'text-blue-600 dark:text-blue-400',   icon: Users },
            { label: 'Avg Attendance', value: `${Math.round(childStats.reduce((s, c) => s + (c.attendance?.percentage ?? 0), 0) / childStats.length)}%`, color: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', icon: Calendar },
            { label: 'Pending Tasks',  value: childStats.reduce((s, c) => s + (c.upcomingAssignments?.length ?? 0), 0),                  color: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', icon: ClipboardList },
            { label: 'Notices',        value: notices.length,                                                                            color: 'bg-purple-50 dark:bg-purple-950/30',text: 'text-purple-600 dark:text-purple-400',icon: Bell },
          ].map(({ label, value, color, text, icon: Icon }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 p-4 flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', color)}>
                <Icon className={cn('h-5 w-5', text)} />
              </div>
              <div>
                <p className={cn('text-xl font-bold leading-none', text)}>{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Children cards ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">My Children</h2>
          <span className="text-sm text-gray-400 dark:text-gray-500">{childStats.length} enrolled</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-5 w-20 rounded-lg" />
                  </div>
                  <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3].map((j) => <Skeleton key={j} className="h-12 rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : childStats.length === 0 ? (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 p-12 text-center">
            <div className="h-14 w-14 bg-gray-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">No children linked</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contact your institution administrator to link your child's account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {childStats.map((childStat, i) => (
              <ChildCard key={childStat.student?._id} childStat={childStat} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Latest notices ───────────────────────────────────────── */}
      {notices.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">School Notices</h3>
            </div>
            <Link to="/dashboard/notices"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-surface-800">
            {notices.map((n) => (
              <div key={n._id} className="flex gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-colors">
                <div className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                  n.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' :
                  n.priority === 'high'   ? 'bg-amber-100 dark:bg-amber-900/30' :
                  'bg-primary-50 dark:bg-primary-950/30'
                )}>
                  <Bell className={cn('h-3.5 w-3.5',
                    n.priority === 'urgent' ? 'text-red-600 dark:text-red-400' :
                    n.priority === 'high'   ? 'text-amber-600 dark:text-amber-400' :
                    'text-primary-600 dark:text-primary-400'
                  )} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{n.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.content}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
                {n.priority !== 'normal' && n.priority !== 'low' && (
                  <Badge variant={n.priority === 'urgent' ? 'danger' : 'warning'} size="sm" className="shrink-0 self-start mt-0.5">
                    {n.priority}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
