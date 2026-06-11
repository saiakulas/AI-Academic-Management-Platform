import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { UserPlus, Users, Pencil, Trash2, Eye } from 'lucide-react'

import { studentsApi } from '@/api/students.api'
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
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'

const createSchema = z.object({
  firstName:   z.string().min(2, 'First name is required'),
  lastName:    z.string().min(2, 'Last name is required'),
  email:       z.string().email('Valid email required'),
  rollNumber:  z.string().min(1, 'Roll number is required'),
  gender:      z.enum(['male', 'female', 'other']).optional(),
  phone:       z.string().optional(),
})

export default function StudentsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchStudents = useCallback((params) => studentsApi.list(params), [])
  const { data: students, pagination, loading, search, goToPage, applySearch, refetch } = usePagination(fetchStudents)

  const { mutate: createStudent, loading: creating } = useMutation((d) => studentsApi.create(d))
  const { mutate: deleteStudent, loading: deleting } = useMutation((id) => studentsApi.remove(id))

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(createSchema) })

  const onCreate = async (data) => {
    const result = await createStudent(data)
    if (result.success) {
      toast.success('Student created successfully')
      setCreateOpen(false)
      reset()
      refetch()
    } else {
      toast.error(result.message)
    }
  }

  const onDelete = async () => {
    const result = await deleteStudent(deleteTarget._id)
    if (result.success) {
      toast.success('Student deactivated')
      setDeleteTarget(null)
      refetch()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in-up">
      <PageHeader
        title="Students"
        description="Manage student enrollment and academic profiles"
        actions={
          <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Add Student
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <SearchInput
          placeholder="Search by name, email, roll no..."
          onSearch={applySearch}
          className="w-64"
        />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Student</Th>
              <Th>Roll No.</Th>
              <Th>Class</Th>
              <Th>Gender</Th>
              <Th>Admission</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <Td key={j}><Skeleton className="h-4 w-24" /></Td>
                  ))}
                </Tr>
              ))
            ) : students.length === 0 ? (
              <Tr>
                <Td colSpan={7}>
                  <EmptyState icon={Users} title="No students found"
                    description={search ? 'Try adjusting your search' : 'Add your first student to get started'} />
                </Td>
              </Tr>
            ) : students.map((s) => {
              const user = s.user || {}
              const name = `${user.firstName || ''} ${user.lastName || ''}`.trim()
              return (
                <Tr key={s._id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={name} src={user.avatar} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td><span className="font-mono text-xs">{s.rollNumber}</span></Td>
                  <Td>
                    {s.currentClass
                      ? <Badge variant="blue">{`Grade ${s.currentClass.grade}-${s.currentClass.section}`}</Badge>
                      : <span className="text-gray-400 text-xs">Unassigned</span>}
                  </Td>
                  <Td className="capitalize">{s.gender || '—'}</Td>
                  <Td>{formatDate(s.admissionDate)}</Td>
                  <Td>
                    <Badge variant={s.isActive ? 'success' : 'danger'} dot>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" title="Delete"
                        onClick={() => setDeleteTarget(s)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
        {!loading && students.length > 0 && (
          <div className="px-4 border-t border-gray-100 dark:border-surface-800">
            <Pagination pagination={{ ...pagination, limit: 10 }} onPageChange={goToPage} />
          </div>
        )}
      </motion.div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset() }} title="Add New Student" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); reset() }}>Cancel</Button>
            <Button onClick={handleSubmit(onCreate)} isLoading={creating} loadingText="Creating...">Create Student</Button>
          </>
        }
      >
        <form className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" required placeholder="John" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last name"  required placeholder="Doe"  error={errors.lastName?.message}  {...register('lastName')} />
          </div>
          <Input label="Email address" type="email" required placeholder="student@school.edu" error={errors.email?.message} {...register('email')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Roll number" required placeholder="S001" error={errors.rollNumber?.message} {...register('rollNumber')} />
            <Input label="Phone" placeholder="+1234567890" error={errors.phone?.message} {...register('phone')} />
          </div>
          <Select label="Gender" placeholder="Select gender"
            options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]}
            error={errors.gender?.message} {...register('gender')} />
          <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-surface-800 rounded-lg px-3 py-2">
            Default password: <span className="font-mono font-medium">Student@1234</span> — student must change on first login.
          </p>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Deactivate Student"
        message={`Are you sure you want to deactivate ${deleteTarget?.user?.firstName} ${deleteTarget?.user?.lastName}? Their account will be disabled but data will be preserved.`}
        confirmLabel="Deactivate"
      />
    </div>
  )
}
