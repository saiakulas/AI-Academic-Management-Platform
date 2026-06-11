import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { UserPlus, GraduationCap, Trash2 } from 'lucide-react'

import { teachersApi } from '@/api/teachers.api'
import { usePagination } from '@/hooks/usePagination'
import { useMutation } from '@/hooks/useQuery'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import SearchInput from '@/components/ui/SearchInput'
import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Input from '@/components/ui/Input'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'

const createSchema = z.object({
  firstName:   z.string().min(2),
  lastName:    z.string().min(2),
  email:       z.string().email(),
  employeeId:  z.string().min(1, 'Employee ID is required'),
  department:  z.string().optional(),
  designation: z.string().optional(),
  phone:       z.string().optional(),
})

export default function TeachersPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchTeachers = useCallback((p) => teachersApi.list(p), [])
  const { data: teachers, pagination, loading, search, goToPage, applySearch, refetch } = usePagination(fetchTeachers)

  const { mutate: createTeacher, loading: creating } = useMutation((d) => teachersApi.create(d))
  const { mutate: deleteTeacher, loading: deleting } = useMutation((id) => teachersApi.remove(id))

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(createSchema) })

  const onCreate = async (data) => {
    const result = await createTeacher(data)
    if (result.success) { toast.success('Teacher created'); setCreateOpen(false); reset(); refetch() }
    else toast.error(result.message)
  }

  const onDelete = async () => {
    const result = await deleteTeacher(deleteTarget._id)
    if (result.success) { toast.success('Teacher deactivated'); setDeleteTarget(null); refetch() }
    else toast.error(result.message)
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in-up">
      <PageHeader
        title="Teachers"
        description="Manage faculty and staff profiles"
        actions={
          <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Add Teacher
          </Button>
        }
      />

      <div className="flex items-center gap-3 mb-5">
        <SearchInput placeholder="Search by name, employee ID..." onSearch={applySearch} className="w-64" />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Teacher</Th>
              <Th>Employee ID</Th>
              <Th>Department</Th>
              <Th>Designation</Th>
              <Th>Joined</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Tr key={i}>{Array.from({ length: 7 }).map((_, j) => <Td key={j}><Skeleton className="h-4 w-20" /></Td>)}</Tr>
              ))
            ) : teachers.length === 0 ? (
              <Tr><Td colSpan={7}><EmptyState icon={GraduationCap} title="No teachers found" description={search ? 'Try adjusting search' : 'Add your first teacher'} /></Td></Tr>
            ) : teachers.map((t) => {
              const user = t.user || {}
              const name = `${user.firstName || ''} ${user.lastName || ''}`.trim()
              return (
                <Tr key={t._id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={name} src={user.avatar} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td><span className="font-mono text-xs">{t.employeeId}</span></Td>
                  <Td>{t.department || '—'}</Td>
                  <Td>{t.designation || '—'}</Td>
                  <Td>{formatDate(t.joiningDate)}</Td>
                  <Td><Badge variant={t.isActive ? 'success' : 'danger'} dot>{t.isActive ? 'Active' : 'Inactive'}</Badge></Td>
                  <Td>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(t)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
        {!loading && teachers.length > 0 && (
          <div className="px-4 border-t border-gray-100 dark:border-surface-800">
            <Pagination pagination={{ ...pagination, limit: 10 }} onPageChange={goToPage} />
          </div>
        )}
      </motion.div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset() }} title="Add New Teacher" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); reset() }}>Cancel</Button>
            <Button onClick={handleSubmit(onCreate)} isLoading={creating} loadingText="Creating...">Create Teacher</Button>
          </>
        }
      >
        <form className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" required placeholder="Sarah" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last name"  required placeholder="Green" error={errors.lastName?.message}  {...register('lastName')} />
          </div>
          <Input label="Email" type="email" required placeholder="teacher@school.edu" error={errors.email?.message} {...register('email')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Employee ID" required placeholder="EMP001" error={errors.employeeId?.message} {...register('employeeId')} />
            <Input label="Phone" placeholder="+1234567890" {...register('phone')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Department" placeholder="Science" {...register('department')} />
            <Input label="Designation" placeholder="Senior Teacher" {...register('designation')} />
          </div>
          <p className="text-xs text-gray-500 bg-gray-50 dark:bg-surface-800 rounded-lg px-3 py-2">
            Default password: <span className="font-mono font-medium">Teacher@1234</span>
          </p>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={onDelete} loading={deleting}
        title="Deactivate Teacher"
        message={`Deactivate ${deleteTarget?.user?.firstName} ${deleteTarget?.user?.lastName}? Their account will be disabled.`}
        confirmLabel="Deactivate" />
    </div>
  )
}
