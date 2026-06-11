import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ClipboardList, Plus, Trash2, Send } from 'lucide-react'

import { assignmentsApi } from '@/api/assignments.api'
import { classesApi } from '@/api/classes.api'
import { subjectsApi } from '@/api/subjects.api'
import { usePagination } from '@/hooks/usePagination'
import { useQuery, useMutation } from '@/hooks/useQuery'
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
import useAuthStore from '@/store/authStore'

const createSchema = z.object({
  title:       z.string().min(3),
  class:       z.string().min(1, 'Class is required'),
  subject:     z.string().min(1, 'Subject is required'),
  dueDate:     z.string().min(1, 'Due date is required'),
  totalMarks:  z.coerce.number().min(1).max(1000).default(100),
  description: z.string().optional(),
  instructions:z.string().optional(),
})

const submitSchema = z.object({ content: z.string().min(1, 'Submission content is required') })

export default function AssignmentsPage() {
  const { user } = useAuthStore()
  const isStudent = user?.role === 'student'
  const canCreate = ['admin', 'teacher'].includes(user?.role)

  const [createOpen,  setCreateOpen]  = useState(false)
  const [submitOpen,  setSubmitOpen]  = useState(false)
  const [submitTarget,setSubmitTarget]= useState(null)
  const [deleteTarget,setDeleteTarget]= useState(null)

  const fetchAssignments = useCallback((p) => assignmentsApi.list(p), [])
  const { data: assignments, pagination, loading, goToPage, refetch } = usePagination(fetchAssignments)

  const { data: classesData } = useQuery(() => classesApi.list({ limit: 100, isActive: true }), [])
  const { data: subjectsData } = useQuery(() => subjectsApi.list({ limit: 100, isActive: true }), [])
  const classOptions   = (classesData?.data || []).map((c) => ({ value: c._id, label: `Grade ${c.grade}-${c.section}` }))
  const subjectOptions = (subjectsData?.data || []).map((s) => ({ value: s._id, label: `${s.name} (${s.code})` }))

  const { mutate: createAssignment, loading: creating } = useMutation((d) => assignmentsApi.create(d))
  const { mutate: deleteAssignment, loading: deleting } = useMutation((id) => assignmentsApi.remove(id))
  const { mutate: submitAssignment, loading: submitting } = useMutation((id, d) => assignmentsApi.submit(id, d))

  const createForm = useForm({ resolver: zodResolver(createSchema), defaultValues: { totalMarks: 100 } })
  const submitForm = useForm({ resolver: zodResolver(submitSchema) })

  const onCreate = async (data) => {
    const result = await createAssignment(data)
    if (result.success) { toast.success('Assignment created'); setCreateOpen(false); createForm.reset(); refetch() }
    else toast.error(result.message)
  }

  const onSubmit = async (data) => {
    const result = await submitAssignment(submitTarget._id, data)
    if (result.success) { toast.success('Assignment submitted'); setSubmitOpen(false); submitForm.reset(); refetch() }
    else toast.error(result.message)
  }

  const onDelete = async () => {
    const result = await deleteAssignment(deleteTarget._id)
    if (result.success) { toast.success('Assignment deleted'); setDeleteTarget(null); refetch() }
    else toast.error(result.message)
  }

  const isOverdue = (dueDate) => new Date(dueDate) < new Date()

  return (
    <div className="p-6 lg:p-8 animate-fade-in-up">
      <PageHeader
        title="Assignments"
        description="Create, manage and track student assignments"
        actions={canCreate && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Create Assignment
          </Button>
        )}
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
        <Table>
          <Thead>
            <Tr><Th>Title</Th><Th>Class</Th><Th>Subject</Th><Th>Due Date</Th><Th>Marks</Th><Th>Submissions</Th><Th>Status</Th><Th>Actions</Th></Tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Tr key={i}>{Array.from({ length: 8 }).map((_, j) => <Td key={j}><Skeleton className="h-4 w-20" /></Td>)}</Tr>
              ))
            ) : assignments.length === 0 ? (
              <Tr><Td colSpan={8}><EmptyState icon={ClipboardList} title="No assignments found" description={canCreate ? 'Create your first assignment' : 'No assignments available yet'} /></Td></Tr>
            ) : assignments.map((a) => (
              <Tr key={a._id}>
                <Td>
                  <p className="font-medium text-gray-900 dark:text-gray-100 max-w-[200px] truncate">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.assignedBy ? `${a.assignedBy.firstName} ${a.assignedBy.lastName}` : ''}</p>
                </Td>
                <Td>{a.class ? <Badge variant="blue">{`G${a.class.grade}-${a.class.section}`}</Badge> : '—'}</Td>
                <Td>{a.subject?.name || '—'}</Td>
                <Td>
                  <span className={isOverdue(a.dueDate) && a.status !== 'closed' ? 'text-red-500 dark:text-red-400 font-medium' : ''}>
                    {formatDate(a.dueDate)}
                  </span>
                </Td>
                <Td>{a.totalMarks}</Td>
                <Td>{a.submissionCount ?? 0}</Td>
                <Td>
                  <Badge variant={a.status === 'published' ? (isOverdue(a.dueDate) ? 'warning' : 'success') : a.status === 'closed' ? 'default' : 'primary'}>
                    {a.status === 'published' && isOverdue(a.dueDate) ? 'Overdue' : a.status}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    {isStudent && a.status === 'published' && (
                      <Button variant="ghost" size="icon-sm" title="Submit" onClick={() => { setSubmitTarget(a); setSubmitOpen(true) }}>
                        <Send className="h-3.5 w-3.5 text-primary-500" />
                      </Button>
                    )}
                    {canCreate && (
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(a)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {!loading && assignments.length > 0 && (
          <div className="px-4 border-t border-gray-100 dark:border-surface-800">
            <Pagination pagination={{ ...pagination, limit: 10 }} onPageChange={goToPage} />
          </div>
        )}
      </motion.div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); createForm.reset() }} title="Create Assignment" size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); createForm.reset() }}>Cancel</Button>
            <Button onClick={createForm.handleSubmit(onCreate)} isLoading={creating} loadingText="Creating...">Create Assignment</Button>
          </>
        }
      >
        <form className="space-y-4" noValidate>
          <Input label="Title" required placeholder="Chapter 5 — Quadratic Equations" error={createForm.formState.errors.title?.message} {...createForm.register('title')} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Class" required placeholder="Select class..." options={classOptions} error={createForm.formState.errors.class?.message} {...createForm.register('class')} />
            <Select label="Subject" required placeholder="Select subject..." options={subjectOptions} error={createForm.formState.errors.subject?.message} {...createForm.register('subject')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Due date" type="date" required error={createForm.formState.errors.dueDate?.message} {...createForm.register('dueDate')} />
            <Input label="Total marks" type="number" placeholder="100" error={createForm.formState.errors.totalMarks?.message} {...createForm.register('totalMarks')} />
          </div>
          <Input label="Description" placeholder="Brief description..." {...createForm.register('description')} />
          <Input label="Instructions" placeholder="Submission instructions..." {...createForm.register('instructions')} />
        </form>
      </Modal>

      {/* Submit Modal (student) */}
      <Modal open={submitOpen} onClose={() => { setSubmitOpen(false); submitForm.reset() }}
        title={`Submit: ${submitTarget?.title}`} size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setSubmitOpen(false); submitForm.reset() }}>Cancel</Button>
            <Button onClick={submitForm.handleSubmit(onSubmit)} isLoading={submitting} loadingText="Submitting...">Submit</Button>
          </>
        }
      >
        <form className="space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Your Answer *</label>
            <textarea rows={6}
              className="w-full rounded-xl border border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm text-gray-900 dark:text-gray-100 px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              placeholder="Write your answer here..."
              {...submitForm.register('content')}
            />
            {submitForm.formState.errors.content && (
              <p className="text-xs text-red-600 mt-1">{submitForm.formState.errors.content.message}</p>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={onDelete} loading={deleting}
        title="Delete Assignment"
        message={`Delete "${deleteTarget?.title}"? All submissions will also be removed.`}
        confirmLabel="Delete" />
    </div>
  )
}
