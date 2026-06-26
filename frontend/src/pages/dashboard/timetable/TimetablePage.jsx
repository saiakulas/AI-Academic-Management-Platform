import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CalendarDays, Plus, Trash2, Edit3, Clock, BookOpen, User, MapPin } from 'lucide-react'

import { timetableApi } from '@/api/timetable.api'
import { classesApi }   from '@/api/classes.api'
import { teachersApi }  from '@/api/teachers.api'
import { subjectsApi }  from '@/api/subjects.api'
import { studentsApi }  from '@/api/students.api'
import { useQuery, useMutation } from '@/hooks/useQuery'
import PageHeader  from '@/components/ui/PageHeader'
import Button      from '@/components/ui/Button'
import Select      from '@/components/ui/Select'
import Input       from '@/components/ui/Input'
import Modal       from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge       from '@/components/ui/Badge'
import Skeleton    from '@/components/ui/Skeleton'
import EmptyState  from '@/components/ui/EmptyState'
import useAuthStore from '@/store/authStore'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const PERIOD_TYPES = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'lab',     label: 'Lab'     },
  { value: 'break',   label: 'Break'   },
  { value: 'free',    label: 'Free'    },
]

const TYPE_COLORS = {
  lecture: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  lab:     'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
  break:   'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  free:    'bg-gray-50 dark:bg-surface-800 border-gray-200 dark:border-surface-700',
}

const TYPE_BADGE = {
  lecture: 'blue',
  lab:     'purple',
  break:   'warning',
  free:    'default',
}

/** A blank period form row */
const blankPeriod = () => ({
  day: 'Monday', periodNumber: 1, startTime: '08:00', endTime: '08:45',
  subject: '', teacher: '', room: '', type: 'lecture', notes: '',
})

export default function TimetablePage() {
  const { user } = useAuthStore()
  const isAdmin   = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'

  const [selectedClassId, setSelectedClassId] = useState('')
  const [createOpen,  setCreateOpen]  = useState(false)
  const [editOpen,    setEditOpen]    = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [deleteTarget,setDeleteTarget]= useState(null)

  // ── Shared lookups ────────────────────────────────────────────
  const { data: classesData } = useQuery(
    () => classesApi.list({ limit: 200, isActive: true }), [],
    { immediate: isAdmin }
  )
  const classOptions = (classesData?.data || []).map((c) => ({
    value: c._id,
    label: `Grade ${c.grade}-${c.section} (${c.academicYear})`,
  }))

  const { data: subjectsData } = useQuery(
    () => subjectsApi.list({ limit: 200, isActive: true }), [],
    { immediate: isAdmin || isTeacher }
  )
  const subjectOptions = [
    { value: '', label: '— None —' },
    ...(subjectsData?.data || []).map((s) => ({ value: s._id, label: `${s.name} (${s.code})` })),
  ]

  const { data: teachersData } = useQuery(
    () => teachersApi.list({ limit: 200 }), [],
    { immediate: isAdmin }
  )
  const teacherOptions = [
    { value: '', label: '— None —' },
    ...(teachersData?.data || []).map((t) => ({
      value: t._id,
      label: `${t.user?.firstName ?? ''} ${t.user?.lastName ?? ''}`.trim(),
    })),
  ]

  // ── Student: resolve own class id ─────────────────────────────
  const { data: myStudentData } = useQuery(
    () => studentsApi.getById(user?._id), [user?._id],
    { immediate: isStudent }
  )
  const studentClassId = myStudentData?.student?.currentClass?._id
    || myStudentData?.student?.currentClass

  useEffect(() => {
    if (isStudent && studentClassId) setSelectedClassId(studentClassId)
  }, [isStudent, studentClassId])

  // ── Teacher: load own timetables ──────────────────────────────
  const { data: myTeacherData } = useQuery(
    () => teachersApi.getById(user?._id), [user?._id],
    { immediate: isTeacher }
  )
  const myTeacherId = myTeacherData?.teacher?._id

  const {
    data: teacherTimetables,
    loading: teacherLoading,
    refetch: refetchTeacher,
  } = useQuery(
    () => timetableApi.getByTeacher(myTeacherId), [myTeacherId],
    { immediate: !!myTeacherId }
  )

  // ── Class timetable (admin + student) ─────────────────────────
  const {
    data: classTimetableData,
    loading: classLoading,
    refetch: refetchClass,
  } = useQuery(
    () => timetableApi.getByClass(selectedClassId), [selectedClassId],
    { immediate: !!selectedClassId }
  )
  const classTimetable = classTimetableData?.timetable

  const { mutate: createTimetable, loading: creating } = useMutation((d) => timetableApi.create(d))
  const { mutate: updateTimetable, loading: updating } = useMutation((id, d) => timetableApi.update(id, d))
  const { mutate: deleteTimetable, loading: deleting } = useMutation((id)    => timetableApi.remove(id))

  // ── CRUD handlers ─────────────────────────────────────────────
  const handleCreate = async (formData) => {
    const result = await createTimetable(formData)
    if (result.success) {
      toast.success('Timetable created')
      setCreateOpen(false)
      refetchClass()
    } else {
      toast.error(result.message)
    }
  }

  const handleUpdate = async (formData) => {
    const result = await updateTimetable(editTarget._id, formData)
    if (result.success) {
      toast.success('Timetable updated')
      setEditOpen(false)
      setEditTarget(null)
      refetchClass()
      if (isTeacher) refetchTeacher()
    } else {
      toast.error(result.message)
    }
  }

  const handleDelete = async () => {
    const result = await deleteTimetable(deleteTarget._id)
    if (result.success) {
      toast.success('Timetable deleted')
      setDeleteTarget(null)
      refetchClass()
    } else {
      toast.error(result.message)
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <PageHeader
        title="Timetable"
        description="View and manage weekly class schedules"
        actions={isAdmin && selectedClassId && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            New Timetable
          </Button>
        )}
      />

      {/* Class selector — admin only */}
      {isAdmin && (
        <div className="flex gap-3 items-center flex-wrap">
          <Select
            placeholder="Select a class to view timetable..."
            options={classOptions}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-80"
          />
          {classTimetable && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                onClick={() => { setEditTarget(classTimetable); setEditOpen(true) }}>
                Edit
              </Button>
              <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => setDeleteTarget(classTimetable)}>
                Delete
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Teacher view */}
      {isTeacher && (
        teacherLoading
          ? <TimetableSkeleton />
          : !teacherTimetables?.length
            ? <EmptyState icon={CalendarDays} title="No timetable assigned"
                description="No classes have been scheduled for you yet." />
            : teacherTimetables.map((tt) => (
                <TimetableGrid
                  key={tt._id}
                  timetable={tt}
                  title={`${tt.class?.name ?? ''} — Grade ${tt.class?.grade}-${tt.class?.section}`}
                  subtitle={`Academic Year: ${tt.academicYear}`}
                />
              ))
      )}

      {/* Admin / Student class view */}
      {(isAdmin || isStudent) && (
        !selectedClassId
          ? <EmptyState icon={CalendarDays} title={isAdmin ? 'Select a class' : 'No class assigned'}
              description={isAdmin ? 'Choose a class above to view its timetable.' : 'You are not enrolled in a class yet.'} />
          : classLoading
            ? <TimetableSkeleton />
            : !classTimetable
              ? <EmptyState icon={CalendarDays} title="No timetable found"
                  description={isAdmin ? 'Create a timetable for this class using the button above.' : 'Timetable not published yet.'} />
              : <TimetableGrid
                  timetable={classTimetable}
                  title={`Grade ${classTimetable.class?.grade}-${classTimetable.class?.section}`}
                  subtitle={`Effective from ${new Date(classTimetable.effectiveFrom).toLocaleDateString()}`}
                />
      )}

      {/* Modals */}
      {isAdmin && (
        <>
          <TimetableFormModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onSubmit={handleCreate}
            loading={creating}
            classOptions={classOptions}
            subjectOptions={subjectOptions}
            teacherOptions={teacherOptions}
            defaultClassId={selectedClassId}
            title="Create Timetable"
          />
          <TimetableFormModal
            open={editOpen}
            onClose={() => { setEditOpen(false); setEditTarget(null) }}
            onSubmit={handleUpdate}
            loading={updating}
            classOptions={classOptions}
            subjectOptions={subjectOptions}
            teacherOptions={teacherOptions}
            defaultClassId={editTarget?.class?._id || editTarget?.class}
            initialData={editTarget}
            title="Edit Timetable"
          />
          <ConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            loading={deleting}
            title="Delete Timetable"
            message="This will permanently delete the timetable. Are you sure?"
            confirmLabel="Delete"
          />
        </>
      )}
    </div>
  )
}

// ── Timetable Grid ────────────────────────────────────────────────────────────
function TimetableGrid({ timetable, title, subtitle }) {
  const periods = timetable?.periods || []

  // Group periods by day
  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = periods
      .filter((p) => p.day === d)
      .sort((a, b) => a.periodNumber - b.periodNumber)
    return acc
  }, {})

  const activeDays = DAYS.filter((d) => byDay[d].length > 0)

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {activeDays.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={CalendarDays} title="No periods defined" description="This timetable has no periods yet." />
          </div>
        ) : (
          <div className="min-w-[640px]">
            {/* Day columns header */}
            <div
              className="grid border-b border-gray-100 dark:border-surface-800"
              style={{ gridTemplateColumns: `80px repeat(${activeDays.length}, 1fr)` }}
            >
              <div className="px-3 py-2.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider" />
              {activeDays.map((d) => (
                <div key={d} className="px-3 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-l border-gray-100 dark:border-surface-800">
                  {d.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Period rows — find max periods across all days */}
            {Array.from({ length: Math.max(...activeDays.map((d) => byDay[d].length), 0) }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="grid border-b border-gray-100 dark:border-surface-800 last:border-0"
                style={{ gridTemplateColumns: `80px repeat(${activeDays.length}, 1fr)` }}
              >
                <div className="px-3 py-3 flex items-center justify-center text-xs font-mono font-semibold text-gray-400 dark:text-gray-500">
                  P{rowIdx + 1}
                </div>
                {activeDays.map((d) => {
                  const p = byDay[d][rowIdx]
                  return (
                    <div key={d} className={`px-3 py-3 border-l border-gray-100 dark:border-surface-800 min-h-[80px]`}>
                      {p ? <PeriodCell period={p} /> : null}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Period Cell ───────────────────────────────────────────────────────────────
function PeriodCell({ period }) {
  const teacherName = period.teacher
    ? `${period.teacher.user?.firstName ?? ''} ${period.teacher.user?.lastName ?? ''}`.trim()
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-2.5 h-full space-y-1.5 ${TYPE_COLORS[period.type] || TYPE_COLORS.lecture}`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{period.startTime}–{period.endTime}</span>
        </div>
        <Badge variant={TYPE_BADGE[period.type]} className="text-[10px] py-0 px-1.5">
          {period.type}
        </Badge>
      </div>

      {period.subject && (
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3 w-3 shrink-0 text-gray-400" />
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
            {period.subject.name ?? period.subject}
          </span>
        </div>
      )}

      {teacherName && (
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 shrink-0 text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{teacherName}</span>
        </div>
      )}

      {period.room && (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-500 truncate">{period.room}</span>
        </div>
      )}

      {period.notes && (
        <p className="text-[11px] text-gray-400 italic truncate">{period.notes}</p>
      )}
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function TimetableSkeleton() {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Timetable Form Modal ──────────────────────────────────────────────────────
function TimetableFormModal({
  open, onClose, onSubmit, loading,
  classOptions, subjectOptions, teacherOptions,
  defaultClassId, initialData, title,
}) {
  const [classId,       setClassId]       = useState(defaultClassId || '')
  const [academicYear,  setAcademicYear]  = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState('')
  const [effectiveTo,   setEffectiveTo]   = useState('')
  const [periods,       setPeriods]       = useState([blankPeriod()])

  // Populate from existing timetable when editing
  useEffect(() => {
    if (open && initialData) {
      setClassId(initialData.class?._id || initialData.class || '')
      setAcademicYear(initialData.academicYear || '')
      setEffectiveFrom(initialData.effectiveFrom
        ? new Date(initialData.effectiveFrom).toISOString().split('T')[0] : '')
      setEffectiveTo(initialData.effectiveTo
        ? new Date(initialData.effectiveTo).toISOString().split('T')[0] : '')
      // Normalise populated period fields back to IDs
      setPeriods((initialData.periods || []).map((p) => ({
        day:          p.day,
        periodNumber: p.periodNumber,
        startTime:    p.startTime,
        endTime:      p.endTime,
        subject:      p.subject?._id  || p.subject  || '',
        teacher:      p.teacher?._id  || p.teacher  || '',
        room:         p.room  || '',
        type:         p.type  || 'lecture',
        notes:        p.notes || '',
      })))
    } else if (open) {
      setClassId(defaultClassId || '')
      setAcademicYear('')
      setEffectiveFrom('')
      setEffectiveTo('')
      setPeriods([blankPeriod()])
    }
  }, [open, initialData, defaultClassId])

  const updatePeriod = (idx, field, value) =>
    setPeriods((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))

  const addPeriod    = () => setPeriods((prev) => [...prev, blankPeriod()])
  const removePeriod = (idx) => setPeriods((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = () => {
    if (!classId)       return toast.error('Please select a class')
    if (!academicYear)  return toast.error('Academic year is required')
    if (!effectiveFrom) return toast.error('Effective from date is required')
    if (!periods.length) return toast.error('Add at least one period')

    const clean = periods.map((p) => ({
      ...p,
      subject: p.subject || null,
      teacher: p.teacher || null,
      room:    p.room    || '',
      notes:   p.notes   || '',
    }))

    onSubmit({ classId, academicYear, effectiveFrom, effectiveTo: effectiveTo || null, periods: clean })
  }

  const dayOptions     = DAYS.map((d) => ({ value: d, label: d }))
  const periodNumOpts  = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Period ${i + 1}` }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={loading} loadingText="Saving...">
            {initialData ? 'Save Changes' : 'Create Timetable'}
          </Button>
        </>
      }
    >
      <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          <Select label="Class" required placeholder="Select class..."
            options={classOptions} value={classId}
            onChange={(e) => setClassId(e.target.value)} />
          <Input label="Academic Year" required placeholder="2024-25"
            value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Effective From" type="date" required
            value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
          <Input label="Effective To" type="date"
            value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
        </div>

        {/* Periods */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Periods</p>
            <Button variant="secondary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={addPeriod}>
              Add Period
            </Button>
          </div>

          <div className="space-y-3">
            {periods.map((p, idx) => (
              <PeriodFormRow
                key={idx}
                period={p}
                idx={idx}
                dayOptions={dayOptions}
                periodNumOpts={periodNumOpts}
                subjectOptions={subjectOptions}
                teacherOptions={teacherOptions}
                onChange={updatePeriod}
                onRemove={removePeriod}
                canRemove={periods.length > 1}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ── Period Form Row ───────────────────────────────────────────────────────────
function PeriodFormRow({
  period, idx, dayOptions, periodNumOpts,
  subjectOptions, teacherOptions,
  onChange, onRemove, canRemove,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 p-4 space-y-3"
    >
      {/* Row 1: day / period / type / times */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
        <Select label="Day" options={dayOptions} value={period.day}
          onChange={(e) => onChange(idx, 'day', e.target.value)} />
        <Select label="Period #" options={periodNumOpts} value={String(period.periodNumber)}
          onChange={(e) => onChange(idx, 'periodNumber', Number(e.target.value))} />
        <Select label="Type" options={PERIOD_TYPES} value={period.type}
          onChange={(e) => onChange(idx, 'type', e.target.value)} />
        <Input label="Start" type="time" value={period.startTime}
          onChange={(e) => onChange(idx, 'startTime', e.target.value)} />
        <Input label="End" type="time" value={period.endTime}
          onChange={(e) => onChange(idx, 'endTime', e.target.value)} />
      </div>

      {/* Row 2: subject / teacher / room */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
        <Select label="Subject" options={subjectOptions} value={period.subject}
          onChange={(e) => onChange(idx, 'subject', e.target.value)} />
        <Select label="Teacher" options={teacherOptions} value={period.teacher}
          onChange={(e) => onChange(idx, 'teacher', e.target.value)} />
        <Input label="Room" placeholder="e.g. Room 101" value={period.room}
          onChange={(e) => onChange(idx, 'room', e.target.value)} />
      </div>

      {/* Row 3: notes + remove */}
      <div className="flex gap-2 items-end">
        <Input label="Notes" placeholder="Optional note..." value={period.notes}
          onChange={(e) => onChange(idx, 'notes', e.target.value)}
          className="flex-1" />
        {canRemove && (
          <Button variant="ghost" size="icon-sm" onClick={() => onRemove(idx)}
            className="mb-0.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
