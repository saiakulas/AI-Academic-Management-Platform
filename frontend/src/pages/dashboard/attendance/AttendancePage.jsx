import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Calendar, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react'

import { attendanceApi } from '@/api/attendance.api'
import { classesApi } from '@/api/classes.api'
import { useQuery, useMutation } from '@/hooks/useQuery'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Skeleton, { SkeletonStatCard } from '@/components/ui/Skeleton'
import StatCard from '@/components/dashboard/StatCard'
import EmptyState from '@/components/ui/EmptyState'
import useAuthStore from '@/store/authStore'

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', color: 'success' },
  { value: 'absent',  label: 'Absent',  color: 'danger'  },
  { value: 'late',    label: 'Late',    color: 'warning' },
  { value: 'excused', label: 'Excused', color: 'default' },
]

export default function AttendancePage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'

  const [selectedClass, setSelectedClass] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState({})

  // Load today summary (admin)
  const { data: todaySummary, loading: summaryLoading } = useQuery(
    () => attendanceApi.getTodaySummary(),
    [],
    { immediate: isAdmin }
  )

  // Load classes
  const { data: classesData } = useQuery(() => classesApi.list({ limit: 100, isActive: true }), [])
  const classes = classesData?.data || []
  const classOptions = classes.map((c) => ({ value: c._id, label: `Grade ${c.grade}-${c.section} (${c.academicYear})` }))

  // Load students when class selected
  const { data: studentsData, loading: studentsLoading } = useQuery(
    () => classesApi.getStudents(selectedClass, { limit: 100 }),
    [selectedClass],
    { immediate: !!selectedClass }
  )
  const students = studentsData?.data || []

  const { mutate: markAttendance, loading: marking } = useMutation((d) => attendanceApi.mark(d))

  const setStatus = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }))
  }

  const markAll = (status) => {
    const all = {}
    students.forEach((s) => { all[s._id] = status })
    setRecords(all)
  }

  const onSubmit = async () => {
    if (!selectedClass) return toast.error('Please select a class')
    const recordArr = students.map((s) => ({
      student: s._id,
      status:  records[s._id] || 'present',
    }))

    const result = await markAttendance({
      classId: selectedClass,
      date:    attendanceDate,
      session: 'full-day',
      records: recordArr,
    })

    if (result.success) {
      toast.success('Attendance marked successfully')
      setRecords({})
    } else {
      toast.error(result.message)
    }
  }

  const summary = todaySummary?.summary

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <PageHeader title="Attendance" description="Mark and track student attendance" />

      {/* Today's summary cards (admin only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          ) : summary ? (
            <>
              <StatCard title="Classes Marked" value={summary.classesMarked} icon={Calendar} color="blue" delay={0} />
              <StatCard title="Total Students" value={summary.totalStudents} icon={TrendingUp} color="purple" delay={0.05} />
              <StatCard title="Present Today"  value={summary.totalPresent}  icon={CheckCircle2} color="green"  trend="up" trendValue={`${summary.attendanceRate}%`} delay={0.1} />
              <StatCard title="Absent Today"   value={summary.totalAbsent}   icon={XCircle} color="orange" delay={0.15} />
            </>
          ) : null}
        </div>
      )}

      {/* Mark attendance (admin + teacher) */}
      {(isAdmin || isTeacher) && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-6">
              <Select
                placeholder="Select class..."
                options={classOptions}
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setRecords({}) }}
                className="w-72"
              />
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
              {students.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => markAll('present')}>All Present</Button>
                  <Button variant="secondary" size="sm" onClick={() => markAll('absent')}>All Absent</Button>
                </div>
              )}
            </div>

            {!selectedClass ? (
              <EmptyState icon={Calendar} title="Select a class" description="Choose a class to start marking attendance" />
            ) : studentsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : students.length === 0 ? (
              <EmptyState icon={Calendar} title="No students" description="This class has no active students" />
            ) : (
              <div className="space-y-2">
                {students.map((s) => {
                  const user = s.user || {}
                  const name = `${user.firstName} ${user.lastName}`
                  const status = records[s._id] || 'present'
                  return (
                    <motion.div key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-surface-800 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-12">{s.rollNumber}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setStatus(s._id, opt.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                              status === opt.value
                                ? opt.value === 'present' ? 'bg-emerald-500 text-white'
                                : opt.value === 'absent'  ? 'bg-red-500 text-white'
                                : opt.value === 'late'    ? 'bg-amber-500 text-white'
                                : 'bg-gray-500 text-white'
                                : 'bg-white dark:bg-surface-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}

                <div className="pt-4 flex justify-end">
                  <Button onClick={onSubmit} isLoading={marking} loadingText="Saving...">
                    Save Attendance — {attendanceDate}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
