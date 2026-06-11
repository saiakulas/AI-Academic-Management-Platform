import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Bell, Plus, Trash2, Pin, PinOff, ChevronDown, ChevronUp } from 'lucide-react'

import { noticesApi } from '@/api/notices.api'
import { usePagination } from '@/hooks/usePagination'
import { useMutation } from '@/hooks/useQuery'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import Avatar from '@/components/ui/Avatar'
import { formatRelativeTime, formatDate } from '@/lib/utils'
import useAuthStore from '@/store/authStore'

const CATEGORY_OPTIONS = [
  { value: 'general',  label: 'General'   },
  { value: 'academic', label: 'Academic'  },
  { value: 'event',    label: 'Event'     },
  { value: 'exam',     label: 'Exam'      },
  { value: 'holiday',  label: 'Holiday'   },
  { value: 'circular', label: 'Circular'  },
]

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low'    },
  { value: 'normal', label: 'Normal' },
  { value: 'high',   label: 'High'   },
  { value: 'urgent', label: 'Urgent' },
]

const PRIORITY_COLORS = {
  low: 'default', normal: 'primary', high: 'warning', urgent: 'danger',
}

const CATEGORY_COLORS = {
  general: 'default', academic: 'blue', event: 'purple',
  exam: 'danger', holiday: 'success', circular: 'orange',
}

const AUDIENCE_OPTIONS = ['admin','teacher','student','parent'].map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))

const createSchema = z.object({
  title:    z.string().min(3, 'Title is required'),
  content:  z.string().min(10, 'Content must be at least 10 characters'),
  priority: z.string().default('normal'),
  category: z.string().default('general'),
})

export default function NoticesPage() {
  const { user } = useAuthStore()
  const canManage = ['admin', 'teacher'].includes(user?.role)
  const isAdmin   = user?.role === 'admin'

  const [createOpen,  setCreateOpen]  = useState(false)
  const [deleteTarget,setDeleteTarget]= useState(null)
  const [expandedId,  setExpandedId]  = useState(null)
  const [audience,    setAudience]    = useState([])

  const fetchNotices = useCallback((p) => noticesApi.list(p), [])
  const { data: notices, pagination, loading, goToPage, refetch } = usePagination(fetchNotices)

  const { mutate: createNotice,  loading: creating } = useMutation((d) => noticesApi.create(d))
  const { mutate: deleteNotice,  loading: deleting } = useMutation((id) => noticesApi.remove(id))
  const { mutate: pinNotice }                        = useMutation((id, v) => noticesApi.pin(id, v))

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { priority: 'normal', category: 'general' },
  })

  const onCreate = async (data) => {
    const result = await createNotice({
      ...data,
      targetAudience: audience.length ? audience : ['admin','teacher','student','parent'],
    })
    if (result.success) { toast.success('Notice published'); setCreateOpen(false); reset(); setAudience([]); refetch() }
    else toast.error(result.message)
  }

  const onDelete = async () => {
    const result = await deleteNotice(deleteTarget._id)
    if (result.success) { toast.success('Notice deleted'); setDeleteTarget(null); refetch() }
    else toast.error(result.message)
  }

  const onPin = async (notice) => {
    await pinNotice(notice._id, !notice.isPinned)
    refetch()
    toast.success(notice.isPinned ? 'Notice unpinned' : 'Notice pinned')
  }

  const toggleAudience = (role) => {
    setAudience((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role])
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in-up">
      <PageHeader
        title="Notices & Announcements"
        description="Publish and manage institutional announcements"
        actions={canManage && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Post Notice
          </Button>
        )}
      />

      {/* Notice feed */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 p-5 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : notices.length === 0 ? (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800">
            <EmptyState icon={Bell} title="No notices" description="No announcements have been posted yet" />
          </div>
        ) : notices.map((notice, i) => (
          <motion.div
            key={notice._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Pinned indicator */}
            {notice.isPinned && (
              <div className="h-1 bg-primary-500" />
            )}

            <div className="p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {notice.isPinned && (
                    <Pin className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug">{notice.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant={PRIORITY_COLORS[notice.priority] || 'default'} size="sm">
                        {notice.priority}
                      </Badge>
                      <Badge variant={CATEGORY_COLORS[notice.category] || 'default'} size="sm">
                        {notice.category}
                      </Badge>
                      {(notice.targetAudience || []).map((role) => (
                        <span key={role} className="text-xs bg-gray-100 dark:bg-surface-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {isAdmin && (
                    <Button variant="ghost" size="icon-sm" title={notice.isPinned ? 'Unpin' : 'Pin'} onClick={() => onPin(notice)}>
                      {notice.isPinned
                        ? <PinOff className="h-3.5 w-3.5 text-gray-500" />
                        : <Pin className="h-3.5 w-3.5 text-gray-500" />}
                    </Button>
                  )}
                  {canManage && (
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(notice)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" onClick={() => setExpandedId(expandedId === notice._id ? null : notice._id)}>
                    {expandedId === notice._id
                      ? <ChevronUp className="h-3.5 w-3.5" />
                      : <ChevronDown className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Content (expandable) */}
              <AnimatePresence>
                {expandedId === notice._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap border-t border-gray-100 dark:border-surface-800 pt-4">
                      {notice.content}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-surface-800">
                <Avatar
                  name={notice.author ? `${notice.author.firstName} ${notice.author.lastName}` : 'Unknown'}
                  size="xs"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {notice.author ? `${notice.author.firstName} ${notice.author.lastName}` : 'Unknown'}
                  {' · '}{formatRelativeTime(notice.createdAt)}
                </span>
                {notice.expiresAt && (
                  <span className="ml-auto text-xs text-amber-600 dark:text-amber-400">
                    Expires {formatDate(notice.expiresAt)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {!loading && notices.length > 0 && pagination.pages > 1 && (
        <div className="mt-4">
          <Pagination pagination={{ ...pagination, limit: 10 }} onPageChange={goToPage} />
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); reset(); setAudience([]) }}
        title="Post New Notice"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); reset(); setAudience([]) }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onCreate)} isLoading={creating} loadingText="Publishing...">
              Publish Notice
            </Button>
          </>
        }
      >
        <form className="space-y-4" noValidate>
          <Input
            label="Title" required placeholder="e.g. Annual Sports Day — November 30"
            error={errors.title?.message} {...register('title')}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Write the notice content here..."
              className="w-full rounded-xl border border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm text-gray-900 dark:text-gray-100 px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              {...register('content')}
            />
            {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" options={CATEGORY_OPTIONS} {...register('category')} />
            <Select label="Priority" options={PRIORITY_OPTIONS} {...register('priority')} />
          </div>

          {/* Audience selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Target Audience
              <span className="text-xs font-normal text-gray-500 ml-2">(empty = all roles)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {AUDIENCE_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => toggleAudience(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    audience.includes(opt.value)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-surface-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-surface-700 hover:border-primary-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete Notice"
        message={`Delete notice "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
