import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { BarChart3, Plus, Trash2, Eye, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

import { resultsApi } from '@/api/results.api'
import { studentsApi } from '@/api/students.api'
import { classesApi } from '@/api/classes.api'
import { subjectsApi } from '@/api/subjects.api'
import { usePagination } from '@/hooks/usePagination'
import { useQuery, useMutation } from '@/hooks/useQuery'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import useAuthStore from '@/store/authStore'
import { cn } from '@/lib/utils'

const EXAM_TYPES = [
  { value: 'unit-test',   label: 'Unit Test'    },
  { value: 'midterm',     label: 'Mid-Term'     },
  { value: 'final',       label: 'Final Exam'   },
  { value: 'quarterly',   label: 'Quarterly'    },
  { value: 'half-yearly', label: 'Half-Yearly'  },
  { value: 'annual',      label: 'Annual'       },
]

const GRADE_COLORS = { 'A+':'success', A:'success', 'B+':'primary', B:'primary', C:'warning', D:'warning', F:'danger' }

const gradeEntrySchema = z.object({
  subject:       z.string().min(1, 'Subject required'),
  marksObtained: z.coerce.number().min(0),
  totalMarks:    z.coerce.number().min(1),
})
const createSchema = z.object({
  student:      z.string().min(1, 'Student required'),
  class:        z.string().min(1, 'Class required'),
  academicYear: z.string().min(1, 'Academic year required'),
  examType:     z.string().min(1, 'Exam type required'),
  examName:     z.string().optional(),
  isPublished:  z.boolean().default(false),
  grades:       z.array(gradeEntrySchema).min(1, 'Add at least one subject grade'),
})

function getPctColor(pct) {
  if (pct >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (pct >= 60) return 'text-blue-600 dark:text-blue-400'
  if (pct >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function PerformanceBar({ value, max = 100 }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-surface-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn('text-xs font-semibold w-10 text-right', getPctColor(pct))}>{value}%</span>
    </div>
  )
}

export default function ResultsPage() {
  const { user } = useAuthStore()
  const canManage = ['admin', 'teacher'].includes(user?.role)
  const isStudent = user?.role === 'student'

  const [createOpen,   setCreateOpen]   = useState(false)
  const [perfOpen,     setPerfOpen]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filterClass,  setFilterClass]  = useState('')
  const [filterExam,   setFilterExam]   = useState('')

  const fetchResults = useCallback(
    (p) => resultsApi.list({ ...p, classId: filterClass || undefined, examType: filterExam || undefined }),
    [filterClass, filterExam]
  )
  const { data: results, pagination, loading, goToPage, refetch } = usePagination(fetchResults, {}, {})

  const { data: classesData }  = useQuery(() => classesApi.list({ limit: 100, isActive: true }), [])
  const { data: subjectsData } = useQuery(() => subjectsApi.list({ limit: 100, isActive: true }), [])
  const { data: studentsData } = useQuery(() => studentsApi.list({ limit: 200 }), [])

  const classOptions   = (classesData?.data   || []).map((c) => ({ value: c._id, label: `Grade ${c.grade}-${c.section}` }))
  const subjectOptions = (subjectsData?.data   || []).map((s) => ({ value: s._id, label: `${s.name} (${s.code})` }))
  const studentOptions = (studentsData?.data   || []).map((s) => {
    const u = s.user || {}
    return { value: s._id, label: `${u.firstName} ${u.lastName} — ${s.rollNumber}` }
  })

  const { mutate: createResult, loading: creating } = useMutation((d) => resultsApi.create(d))
  const { mutate: deleteResult, loading: deleting } = useMutation((id) => resultsApi.remove(id))
  const { mutate: togglePublish } = useMutation((id, v) => resultsApi.togglePublish(id, v))

  // Performance analytics state
  const [perfClassId, setPerfClassId] = useState('')
  const [perfYear,    setPerfYear]    = useState('2024-25')
  const { data: perfData, loading: perfLoading, refetch: fetchPerf } = useQuery(
    () => resultsApi.getClassPerf(perfClassId, { academicYear: perfYear }),
    [perfClassId, perfYear],
    { immediate: false }
  )

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { academicYear: '2024-25', isPublished: true, grades: [{ subject: '', marksObtained: 0, totalMarks: 100 }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'grades' })

  const onCreate = async (data) => {
    const result = await createResult(data)
    if (result.success) { toast.success('Result created'); setCreateOpen(false); reset(); refetch() }
    else toast.error(result.message)
  }

  const onDelete = async () => {
    const r = await deleteResult(deleteTarget._id)
    if (r.success) { toast.success('Result deleted'); setDeleteTarget(null); refetch() }
    else toast.error(r.message)
  }

  const onTogglePublish = async (result) => {
    await togglePublish(result._id, !result.isPublished)
    toast.success(result.isPublished ? 'Result unpublished' : 'Result published')
    refetch()
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <PageHeader
        title="Results & Performance"
        description="Publish exam results and view academic performance analytics"
        actions={
          <div className="flex gap-2">
            {canManage && (
              <>
                <Button variant="secondary" leftIcon={<BarChart3 className="h-4 w-4" />} onClick={() => setPerfOpen(true)}>
                  Class Performance
                </Button>
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
                  Add Result
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          placeholder="All classes"
          options={classOptions}
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="w-52"
        />
        <Select
          placeholder="All exam types"
          options={EXAM_TYPES}
          value={filterExam}
          onChange={(e) => setFilterExam(e.target.value)}
          className="w-44"
        />
        {(filterClass || filterExam) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterClass(''); setFilterExam('') }}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Results Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Student</Th>
              <Th>Class</Th>
              <Th>Exam</Th>
              <Th>Academic Year</Th>
              <Th>Subjects</Th>
              <Th>Percentage</Th>
              <Th>Grade</Th>
              <Th>Status</Th>
              {canManage && <Th>Actions</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Tr key={i}>{Array.from({ length: 9 }).map((_, j) => <Td key={j}><Skeleton className="h-4 w-16" /></Td>)}</Tr>
              ))
            ) : results.length === 0 ? (
              <Tr><Td colSpan={9}>
                <EmptyState icon={BarChart3} title="No results found" description={canManage ? 'Publish your first exam result' : 'No results available yet'} />
              </Td></Tr>
            ) : results.map((r) => {
              const student = r.student || {}
              const u = student.user || {}
              const name = `${u.firstName || ''} ${u.lastName || ''}`.trim()
              const pct = r.percentage ?? 0
              const examType = EXAM_TYPES.find((e) => e.value === r.examType)?.label || r.examType
              const grade = r.grades?.length > 0
                ? (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F')
                : '—'
              return (
                <Tr key={r._id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={name} size="sm" src={u.avatar} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{name}</p>
                        <p className="text-xs text-gray-400">{student.rollNumber}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>{r.class ? <Badge variant="blue" size="sm">G{r.class.grade}-{r.class.section}</Badge> : '—'}</Td>
                  <Td>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{examType}</p>
                    {r.examName && <p className="text-xs text-gray-400 truncate max-w-[120px]">{r.examName}</p>}
                  </Td>
                  <Td>{r.academicYear}</Td>
                  <Td><span className="text-sm">{r.grades?.length ?? 0} subjects</span></Td>
                  <Td><PerformanceBar value={pct} /></Td>
                  <Td><Badge variant={GRADE_COLORS[grade] || 'default'}>{grade}</Badge></Td>
                  <Td>
                    <Badge variant={r.isPublished ? 'success' : 'warning'} dot size="sm">
                      {r.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </Td>
                  {canManage && (
                    <Td>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" title={r.isPublished ? 'Unpublish' : 'Publish'} onClick={() => onTogglePublish(r)}>
                          {r.isPublished
                            ? <XCircle className="h-3.5 w-3.5 text-amber-500" />
                            : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(r)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </Td>
                  )}
                </Tr>
              )
            })}
          </Tbody>
        </Table>
        {!loading && results.length > 0 && (
          <div className="px-4 border-t border-gray-100 dark:border-surface-800">
            <Pagination pagination={{ ...pagination, limit: 10 }} onPageChange={goToPage} />
          </div>
        )}
      </motion.div>

      {/* Create Result Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset() }}
        title="Add Exam Result" size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); reset() }}>Cancel</Button>
            <Button onClick={handleSubmit(onCreate)} isLoading={creating} loadingText="Saving...">Save Result</Button>
          </>
        }
      >
        <form className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Student" required placeholder="Select student..." options={studentOptions} error={errors.student?.message} {...register('student')} />
            <Select label="Class" required placeholder="Select class..." options={classOptions} error={errors.class?.message} {...register('class')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select label="Exam Type" required options={EXAM_TYPES} error={errors.examType?.message} {...register('examType')} />
            <Input label="Academic Year" required placeholder="2024-25" error={errors.academicYear?.message} {...register('academicYear')} />
            <Input label="Exam Name" placeholder="e.g. Mid-Term Nov 2024" {...register('examName')} />
          </div>

          {/* Grades per subject */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject Grades <span className="text-red-500">*</span>
              </label>
              <Button type="button" variant="ghost" size="sm"
                onClick={() => append({ subject: '', marksObtained: 0, totalMarks: 100 })}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Subject
              </Button>
            </div>
            {errors.grades?.root && <p className="text-xs text-red-600 mb-2">{errors.grades.root.message}</p>}
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-[1fr_100px_100px_36px] gap-2 items-end">
                  <Select placeholder="Select subject..." options={subjectOptions}
                    error={errors.grades?.[idx]?.subject?.message} {...register(`grades.${idx}.subject`)} />
                  <Input label={idx === 0 ? 'Obtained' : ''} type="number" placeholder="85"
                    error={errors.grades?.[idx]?.marksObtained?.message} {...register(`grades.${idx}.marksObtained`)} />
                  <Input label={idx === 0 ? 'Out of' : ''} type="number" placeholder="100"
                    error={errors.grades?.[idx]?.totalMarks?.message} {...register(`grades.${idx}.totalMarks`)} />
                  <div className={idx === 0 ? 'mt-6' : ''}>
                    <Button type="button" variant="ghost" size="icon-sm" disabled={fields.length === 1} onClick={() => remove(idx)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-surface-800">
            <input type="checkbox" id="publishNow" className="rounded" {...register('isPublished')} />
            <label htmlFor="publishNow" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Publish immediately (visible to students)
            </label>
          </div>
        </form>
      </Modal>

      {/* Class Performance Modal */}
      <Modal open={perfOpen} onClose={() => setPerfOpen(false)} title="Class Performance Analytics" size="xl"
        footer={<Button variant="secondary" onClick={() => setPerfOpen(false)}>Close</Button>}
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <Select placeholder="Select class..." options={classOptions} value={perfClassId}
              onChange={(e) => setPerfClassId(e.target.value)} className="w-56" />
            <Input placeholder="Academic year" defaultValue="2024-25"
              onChange={(e) => setPerfYear(e.target.value)} className="w-32" />
            <Button onClick={() => fetchPerf()} disabled={!perfClassId} isLoading={perfLoading} loadingText="Loading...">
              Load Analytics
            </Button>
          </div>

          {perfData?.stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Students', value: perfData.stats.total,   color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Average',  value: `${perfData.stats.average}%`, color: getPctColor(perfData.stats.average) },
                { label: 'Highest',  value: `${perfData.stats.highest}%`, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Pass Rate',value: `${((perfData.stats.passing / perfData.stats.total) * 100).toFixed(0)}%`, color: getPctColor((perfData.stats.passing / perfData.stats.total) * 100) },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl bg-gray-50 dark:bg-surface-800 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {perfData?.results?.length > 0 && (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perfData.results.slice(0, 15).map((r) => ({
                  name: r.student?.user ? `${r.student.user.firstName}` : 'Student',
                  score: r.percentage,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {perfData && perfData.results?.length === 0 && (
            <EmptyState icon={BarChart3} title="No published results" description="No results found for this class and year" />
          )}
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={onDelete} loading={deleting}
        title="Delete Result"
        message={`Delete this result? This cannot be undone.`}
        confirmLabel="Delete" />
    </div>
  )
}
