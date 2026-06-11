import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FolderOpen, Plus, Trash2 } from 'lucide-react'

import { subjectsApi } from '@/api/subjects.api'
import { usePagination } from '@/hooks/usePagination'
import { useMutation } from '@/hooks/useQuery'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import SearchInput from '@/components/ui/SearchInput'
import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Input from '@/components/ui/Input'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

const createSchema = z.object({
  name:       z.string().min(2),
  code:       z.string().min(2).max(10),
  department: z.string().optional(),
  description:z.string().optional(),
})

export default function SubjectsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchSubjects = useCallback((p) => subjectsApi.list(p), [])
  const { data: subjects, pagination, loading, applySearch, goToPage, refetch } = usePagination(fetchSubjects)

  const { mutate: createSubject, loading: creating } = useMutation((d) => subjectsApi.create(d))
  const { mutate: deleteSubject, loading: deleting } = useMutation((id) => subjectsApi.remove(id))

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(createSchema) })

  const onCreate = async (data) => {
    const result = await createSubject({ ...data, code: data.code.toUpperCase() })
    if (result.success) { toast.success('Subject created'); setCreateOpen(false); reset(); refetch() }
    else toast.error(result.message)
  }

  const onDelete = async () => {
    const result = await deleteSubject(deleteTarget._id)
    if (result.success) { toast.success('Subject deactivated'); setDeleteTarget(null); refetch() }
    else toast.error(result.message)
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in-up">
      <PageHeader
        title="Subjects"
        description="Manage curriculum subjects and course codes"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Add Subject
          </Button>
        }
      />

      <div className="flex gap-3 mb-5">
        <SearchInput placeholder="Search subjects..." onSearch={applySearch} className="w-64" />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
        <Table>
          <Thead>
            <Tr><Th>Subject</Th><Th>Code</Th><Th>Department</Th><Th>Grades</Th><Th>Type</Th><Th>Status</Th><Th>Actions</Th></Tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Tr key={i}>{Array.from({ length: 7 }).map((_, j) => <Td key={j}><Skeleton className="h-4 w-20" /></Td>)}</Tr>
              ))
            ) : subjects.length === 0 ? (
              <Tr><Td colSpan={7}><EmptyState icon={FolderOpen} title="No subjects found" description="Create your first subject" /></Td></Tr>
            ) : subjects.map((s) => (
              <Tr key={s._id}>
                <Td><span className="font-medium text-gray-900 dark:text-gray-100">{s.name}</span></Td>
                <Td><Badge variant="blue">{s.code}</Badge></Td>
                <Td>{s.department || '—'}</Td>
                <Td>
                  <div className="flex gap-1 flex-wrap">
                    {(s.grades || []).map((g) => (
                      <span key={g} className="text-xs bg-gray-100 dark:bg-surface-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">G{g}</span>
                    ))}
                  </div>
                </Td>
                <Td><Badge variant={s.isElective ? 'warning' : 'default'}>{s.isElective ? 'Elective' : 'Core'}</Badge></Td>
                <Td><Badge variant={s.isActive ? 'success' : 'danger'} dot>{s.isActive ? 'Active' : 'Inactive'}</Badge></Td>
                <Td>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(s)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {!loading && subjects.length > 0 && (
          <div className="px-4 border-t border-gray-100 dark:border-surface-800">
            <Pagination pagination={{ ...pagination, limit: 10 }} onPageChange={goToPage} />
          </div>
        )}
      </motion.div>

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset() }} title="Add New Subject" size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); reset() }}>Cancel</Button>
            <Button onClick={handleSubmit(onCreate)} isLoading={creating} loadingText="Creating...">Create Subject</Button>
          </>
        }
      >
        <form className="space-y-4" noValidate>
          <Input label="Subject name" required placeholder="Mathematics" error={errors.name?.message} {...register('name')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Subject code" required placeholder="MATH" error={errors.code?.message} {...register('code')} />
            <Input label="Department" placeholder="Science" {...register('department')} />
          </div>
          <Input label="Description" placeholder="Brief description..." {...register('description')} />
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={onDelete} loading={deleting}
        title="Deactivate Subject"
        message={`Deactivate subject "${deleteTarget?.name}" (${deleteTarget?.code})?`}
        confirmLabel="Deactivate" />
    </div>
  )
}
