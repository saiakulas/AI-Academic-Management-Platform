import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  BarChart3, Plus, Trash2, Eye, CheckCircle, XCircle,
  TrendingUp, TrendingDown, Award,
} from 'lucide-react'

import { resultsApi } from '@/api/results.api'
import { classesApi } from '@/api/classes.api'
import { subjectsApi } from '@/api/subjects.api'
import { studentsApi } from '@/api/students.api'
import { usePagination } from '@/hooks/usePagination'
import { useQuery, useMutation } from '@/hooks/useQuery'
import useAuthStore from '@/store/authStore'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'

const gradeSchema = z.object({
  subject:       z.string().min(1, 'Subject required'),
  marksObtained: z.coerce.number().min(0),
  totalMarks:    z.coerce.number().min(1),
  remarks:       z.string().optional(),
})

const createSchema = z.object({
  student:      z.string().min(1, 'Student required'),
  class:        z.string().min(1, 'Class required'),
  academicYear: z.string().min(1, 'Academic year required'),
  examType:     z.enum(['unit-test','midterm','final','quarterly','half-yearly','annual']),
  examName:     z.string().optional(),
  isPublished:  z.boolean().default(false),
  grades:       z.array(gradeSchema).min(1, 'At least one subject grade required'),
})

const EXAM_TYPES = [
  { value: 'unit-test',   label: 'Unit Test'    },
  { value: 'midterm',     label: 'Mid-Term'     },
  { value: 'quarterly',   label: 'Quarterly'    },
  { value: 'half-yearly', label: 'Half-Yearly'  },
  { value: 'final',       label: 'Final'        },
  { value: 'annual',      label: 'Annual'       },
]

const GRADE_BADGE = { 'A+':'purple','A':'blue','B+':'primary','B':'success','C':'warning','D':'orange','F':'danger' }

function getGrade(pct) {
  if (pct >= 90) return 'A+'; if (pct >= 80) return 'A'
  if (pct >= 70) return 'B+'; if (pct >= 60) return 'B'
  if (pct >= 50) return 'C';  if (pct >= 40) return 'D'
  return 'F'
}

export default function ResultsPage() {
  const { user } = useAuthStore()
  const canManage = ['admin','teacher'].includes(user?.role)
  const isAdmin   = user?.role === 'admin'

  const [createOpen,  setCreateOpen]  = useState(false)
  const [detailTarget,setDetailTarget]= useState(null)
  const [deleteTarget,setDeleteTarget]= useState(null)

  const fetchResults = useCallback((p) => resultsApi.list(p), [])
  const { data: results, pagination, loading, goToPage, refetch } = usePagination(fetchResults)

  const { data: classesData  } = useQuery(() => classesApi.list({ limit:100, isActive:true }), [])
  const { data: subjectsData } = useQuery(() => subjectsApi.list({ limit:100, isActive:true }), [])
  const classOptions   = (classesData?.data   || []).map((c) => ({ value: c._id, label:`Grade ${c.grade}-${c.section}` }))
  const subjectOptions = (subjectsData?.data  || []).map((s) => ({ value: s._id, label:`${s.name} (${s.code})` }))

  const { mutate: createResult, loading: creating } = useMutation((d) => resultsApi.create(d))
  const { mutate: deleteResult, loading: deleting } = useMutation((id) => resultsApi.remove(id))
  const { mutate: togglePublish } = useMutation((id, v) => resultsApi.togglePublish(id, v))

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { examType:'midterm', academicYear:'2024-25', isPublished:false, grades:[{ subject:'', marksObtained:0, totalMarks:100 }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name:'grades' })
  const selectedClass = watch('class')

  // Load students when class selected
  const { data: studentsData } = useQuery(
    () => classesApi.getStudents(selectedClass, { limit:100 }),
    [selectedClass],
    { immediate: !!selectedClass }
  )
  const studentOptions = (studentsData?.data || []).map((s) => ({
    value: s._id,
    label: `${s.user?.firstName} ${s.user?.lastName} (${s.rollNumber})`,
  }))

  const onCreate = async (data) => {
    const result = await createResult(data)
    if (result.success) { toast.success('Result created'); setCreateOpen(false); reset(); refetch() }
    else toast.error(result.message)
  }

  const onDelete = async () => {
    const result = await deleteResult(deleteTarget._id)
    if (result.success) { toast.success('Result deleted'); setDeleteTarget(null); refetch() }
    else toast.error(result.message)
  }

  const onTogglePublish = async (r) => {
    await togglePublish(r._id, !r.isPublished)
    toast.success(r.isPublished ? 'Result unpublished' : 'Result published')
    refetch()
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in-up">
      <PageHeader
        title="Results & Performance"
        description="Publish and manage academic exam results"
        actions={canManage && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Add Result
          </Button>
        )}
      />

      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Student</Th><Th>Class</Th><Th>Exam</Th>
              <Th>Year</Th><Th>Percentage</Th><Th>Grade</Th>
              <Th>Published</Th><Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({length:5}).map((_,i)=>(
                <Tr key={i}>{Array.from({length:8}).map((_,j)=><Td key={j}><Skeleton className="h-4 w-20"/></Td>)}</Tr>
              ))
            ) : results.length === 0 ? (
              <Tr><Td colSpan={8}>
                <EmptyState icon={BarChart3} title="No results yet"
                  description={canManage ? 'Publish your first exam result' : 'No results have been published yet'} />
              </Td></Tr>
            ) : results.map((r) => {
              const student = r.student?.user
              const name    = student ? `${student.firstName} ${student.lastName}` : '—'
              const pct     = r.percentage ?? 0
              const grade   = getGrade(pct)
              return (
                <Tr key={r._id}>
                  <Td>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
                    <p className="text-xs text-gray-400">{student?.email}</p>
                  </Td>
                  <Td>{r.class ? <Badge variant="blue">G{r.class.grade}-{r.class.section}</Badge> : '—'}</Td>
                  <Td><span className="capitalize">{r.examType?.replace('-',' ')}</span></Td>
                  <Td>{r.academicYear}</Td>
                  <Td>
                    <span className={`font-semibold ${pct >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {pct}%
                    </span>
                  </Td>
                  <Td><Badge variant={GRADE_BADGE[grade] || 'default'}>{grade}</Badge></Td>
                  <Td>
                    <Badge variant={r.isPublished ? 'success' : 'default'} dot>
                      {r.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" title="View detail" onClick={() => setDetailTarget(r)}>
                        <Eye className="h-3.5 w-3.5 text-primary-500"/>
                      </Button>
                      {canManage && (
                        <Button variant="ghost" size="icon-sm"
                          title={r.isPublished ? 'Unpublish' : 'Publish'}
                          onClick={() => onTogglePublish(r)}>
                          {r.isPublished
                            ? <XCircle className="h-3.5 w-3.5 text-amber-500"/>
                            : <CheckCircle className="h-3.5 w-3.5 text-emerald-500"/>}
                        </Button>
                      )}
                      {isAdmin && (
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(r)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500"/>
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
        {!loading && results.length > 0 && (
          <div className="px-4 border-t border-gray-100 dark:border-surface-800">
            <Pagination pagination={{...pagination, limit:10}} onPageChange={goToPage}/>
          </div>
        )}
      </motion.div>

      {/* Result detail modal */}
      <Modal open={!!detailTarget} onClose={() => setDetailTarget(null)}
        title={`Result — ${detailTarget?.examName || detailTarget?.examType}`} size="lg">
        {detailTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:'Student', value:`${detailTarget.student?.user?.firstName} ${detailTarget.student?.user?.lastName}` },
                { label:'Exam', value:detailTarget.examType?.replace(/-/g,' ') },
                { label:'Academic Year', value:detailTarget.academicYear },
                { label:'Overall', value:`${detailTarget.percentage}%` },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 dark:bg-surface-800 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 capitalize">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-surface-800">
                    <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-semibold uppercase">Subject</th>
                    <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-semibold uppercase">Obtained</th>
                    <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-semibold uppercase">Total</th>
                    <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-semibold uppercase">%</th>
                    <th className="text-center px-4 py-2.5 text-xs text-gray-500 font-semibold uppercase">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-surface-800">
                  {(detailTarget.grades || []).map((g) => {
                    const pct   = g.totalMarks ? +((g.marksObtained/g.totalMarks)*100).toFixed(1) : 0
                    const grade = getGrade(pct)
                    return (
                      <tr key={g._id} className="hover:bg-gray-50 dark:hover:bg-surface-800/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {g.subject?.name || 'Subject'}
                          <span className="ml-1.5 text-xs text-gray-400">({g.subject?.code})</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{g.marksObtained}</td>
                        <td className="px-4 py-3 text-right font-mono text-gray-400">{g.totalMarks}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${pct>=60?'text-emerald-600 dark:text-emerald-400':'text-red-500'}`}>{pct}%</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={GRADE_BADGE[grade]||'default'}>{grade}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
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
            <Select label="Class" required placeholder="Select class…" options={classOptions}
              error={errors.class?.message} {...register('class')} />
            <Select label="Student" required placeholder="Select student…" options={studentOptions}
              error={errors.student?.message} {...register('student')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select label="Exam type" required options={EXAM_TYPES}
              error={errors.examType?.message} {...register('examType')} />
            <Input label="Exam name" placeholder="e.g. Term 1 Mid-Term" {...register('examName')} />
            <Input label="Academic year" required placeholder="2024-25"
              error={errors.academicYear?.message} {...register('academicYear')} />
          </div>

          {/* Grade rows */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject Grades</label>
              <Button type="button" variant="ghost" size="xs"
                leftIcon={<Plus className="h-3 w-3"/>}
                onClick={() => append({ subject:'', marksObtained:0, totalMarks:100 })}>
                Add Subject
              </Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-[1fr_80px_80px_32px] gap-2 items-end">
                  <Select placeholder="Subject…" options={subjectOptions}
                    error={errors.grades?.[i]?.subject?.message}
                    {...register(`grades.${i}.subject`)} />
                  <Input label={i===0?'Obtained':''} type="number" placeholder="85"
                    error={errors.grades?.[i]?.marksObtained?.message}
                    {...register(`grades.${i}.marksObtained`)} />
                  <Input label={i===0?'Total':''} type="number" placeholder="100"
                    {...register(`grades.${i}.totalMarks`)} />
                  <button type="button" onClick={() => remove(i)}
                    className="h-10 w-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 className="h-3.5 w-3.5"/>
                  </button>
                </div>
              ))}
              {errors.grades?.message && (
                <p className="text-xs text-red-600">{errors.grades.message}</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" {...register('isPublished')} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Publish immediately (visible to student)</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete} loading={deleting}
        title="Delete Result"
        message={`Delete this result for ${deleteTarget?.student?.user?.firstName}? This cannot be undone.`}
        confirmLabel="Delete" />
    </div>
  )
}
