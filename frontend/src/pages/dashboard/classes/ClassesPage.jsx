import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { BookOpen, Plus, Trash2, Users } from 'lucide-react'

import { classesApi } from '@/api/classes.api'
import { usePagination } from '@/hooks/usePagination'
import { useMutation } from '@/hooks/useQuery'
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

const createSchema = z.object({
  name:         z.string().min(2),
  section:      z.string().min(1).max(5),
  grade:        z.coerce.number().min(1).max(12),
  academicYear: z.string().regex(/^\d{4}-\d{2,4}$/, 'Format: 2024-25'),
  capacity:     z.coerce.number().min(1).max(100).optional(),
  room:         z.string().optional(),
})

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Grade ${i + 1}` }))

export default function ClassesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchClasses = useCallback((p) => classesApi.list(p), [])
  const { data: classes, pagination, loading, goToPage, refetch } = usePagination(fetchClasses, {}, { limit: 15 })

  const { mutate: createClass, loading: creating } = useMutation((d) => classesApi.create(d))
  const { mutate: deleteClass, loading: deleting } = useMutation((id) => classesApi.remove(id))

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { academicYear: '2024-25', capacity: 40 },
  })

  const onCreate = async (data) => {
    const result = await createClass({ ...data, section: data.section.toUpperCase() })
    if (result.success) { toast.success('Class created'); setCreateOpen(false); reset(); refetch() }
    else toast.error(result.message)
  }

  const onDelete = async () => {
    const result = await deleteClass(deleteTarget._id)
    if (result.success) { toast.success('Class deactivated'); setDeleteTarget(null); refetch() }
    else toast.error(result.message)
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in-up">
      <PageHeader
        title="Classes"
        description="Manage class sections, grades and assignments"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Add Class
          </Button>
        }
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Class</Th>
              <Th>Grade</Th>
              <Th>Section</Th>
              <Th>Academic Year</Th>
              <Th>Class Teacher</Th>
              <Th>Room</Th>
              <Th>Capacity</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Tr key={i}>{Array.from({ length: 9 }).map((_, j) => <Td key={j}><Skeleton className="h-4 w-16" /></Td>)}</Tr>
              ))
            ) : classes.length === 0 ? (
              <Tr><Td colSpan={9}><EmptyState icon={BookOpen} title="No classes found" description="Create your first class section" /></Td></Tr>
            ) : classes.map((c) => {
              const teacher = c.classTeacher?.user
              return (
                <Tr key={c._id}>
                  <Td><span className="font-semibold text-gray-900 dark:text-gray-100">{c.name || c.displayName}</span></Td>
                  <Td><Badge variant="primary">Grade {c.grade}</Badge></Td>
                  <Td><span className="font-mono font-bold text-lg">{c.section}</span></Td>
                  <Td>{c.academicYear}</Td>
                  <Td>{teacher ? `${teacher.firstName} ${teacher.lastName}` : <span className="text-gray-400">Unassigned</span>}</Td>
                  <Td>{c.room || '—'}</Td>
                  <Td>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      {c.studentCount ?? 0} / {c.capacity}
                    </span>
                  </Td>
                  <Td><Badge variant={c.isActive ? 'success' : 'danger'} dot>{c.isActive ? 'Active' : 'Inactive'}</Badge></Td>
                  <Td>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(c)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
        {!loading && classes.length > 0 && (
          <div className="px-4 border-t border-gray-100 dark:border-surface-800">
            <Pagination pagination={{ ...pagination, limit: 15 }} onPageChange={goToPage} />
          </div>
        )}
      </motion.div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset() }} title="Create New Class" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); reset() }}>Cancel</Button>
            <Button onClick={handleSubmit(onCreate)} isLoading={creating} loadingText="Creating...">Create Class</Button>
          </>
        }
      >
        <form className="space-y-4" noValidate>
          <Input label="Class name" required placeholder="Grade 10 - A" error={errors.name?.message} {...register('name')} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Grade" required placeholder="Select grade" options={GRADE_OPTIONS} error={errors.grade?.message} {...register('grade')} />
            <Input label="Section" required placeholder="A" error={errors.section?.message} {...register('section')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Academic year" required placeholder="2024-25" error={errors.academicYear?.message} {...register('academicYear')} />
            <Input label="Room" placeholder="Room 101" {...register('room')} />
          </div>
          <Input label="Capacity" type="number" placeholder="40" error={errors.capacity?.message} {...register('capacity')} />
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={onDelete} loading={deleting}
        title="Deactivate Class"
        message={`Deactivate ${deleteTarget?.name}? This will not delete students but they will be unaffected.`}
        confirmLabel="Deactivate" />
    </div>
  )
}
