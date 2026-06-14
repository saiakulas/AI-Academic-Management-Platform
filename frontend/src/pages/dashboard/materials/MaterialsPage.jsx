import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FileText, Upload, Trash2, Download, Search,
  FileType, BookOpen, Filter, X,
} from 'lucide-react'

import { materialsApi } from '@/api/materials.api'
import { subjectsApi }  from '@/api/subjects.api'
import { classesApi }   from '@/api/classes.api'
import { usePagination } from '@/hooks/usePagination'
import { useQuery, useMutation } from '@/hooks/useQuery'
import PageHeader    from '@/components/ui/PageHeader'
import Button        from '@/components/ui/Button'
import SearchInput   from '@/components/ui/SearchInput'
import Select        from '@/components/ui/Select'
import Badge         from '@/components/ui/Badge'
import Modal         from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Input         from '@/components/ui/Input'
import Pagination    from '@/components/ui/Pagination'
import Skeleton      from '@/components/ui/Skeleton'
import EmptyState    from '@/components/ui/EmptyState'
import Avatar        from '@/components/ui/Avatar'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import useAuthStore from '@/store/authStore'
import { cn } from '@/lib/utils'

const MATERIAL_TYPES = [
  { value: 'notes',         label: 'Notes'         },
  { value: 'assignment',    label: 'Assignment'     },
  { value: 'reference',     label: 'Reference'      },
  { value: 'question-paper',label: 'Question Paper' },
  { value: 'syllabus',      label: 'Syllabus'       },
  { value: 'other',         label: 'Other'          },
]

const TYPE_COLORS = {
  notes: 'blue', assignment: 'purple', reference: 'default',
  'question-paper': 'danger', syllabus: 'success', other: 'default',
}

const FILE_ICONS = {
  pdf:   { label: 'PDF',   bg: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-600 dark:text-red-400'   },
  doc:   { label: 'DOC',   bg: 'bg-blue-100 dark:bg-blue-900/30',  text: 'text-blue-600 dark:text-blue-400' },
  docx:  { label: 'DOCX',  bg: 'bg-blue-100 dark:bg-blue-900/30',  text: 'text-blue-600 dark:text-blue-400' },
  ppt:   { label: 'PPT',   bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  pptx:  { label: 'PPTX',  bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  image: { label: 'IMG',   bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-600 dark:text-green-400' },
  video: { label: 'VID',   bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  other: { label: 'FILE',  bg: 'bg-gray-100 dark:bg-surface-800',   text: 'text-gray-600 dark:text-gray-400' },
}

function FileTypeBadge({ type }) {
  const meta = FILE_ICONS[type] || FILE_ICONS.other
  return (
    <span className={cn('inline-flex items-center justify-center h-9 w-9 rounded-xl text-xs font-bold shrink-0', meta.bg, meta.text)}>
      {meta.label}
    </span>
  )
}

export default function MaterialsPage() {
  const { user } = useAuthStore()
  const canUpload = ['admin', 'teacher'].includes(user?.role)

  const [uploadOpen,   setUploadOpen]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filterSubject,setFilterSubject]= useState('')
  const [filterType,   setFilterType]   = useState('')

  // Upload form state
  const [uploadFile,   setUploadFile]   = useState(null)
  const [uploadMeta,   setUploadMeta]   = useState({ title: '', description: '', subject: '', materialType: 'notes' })
  const [uploading,    setUploading]    = useState(false)
  const fileInputRef = useRef(null)

  const fetchMaterials = useCallback(
    (p) => materialsApi.list({
      ...p,
      subjectId:    filterSubject || undefined,
      materialType: filterType    || undefined,
    }),
    [filterSubject, filterType]
  )
  const { data: materials, pagination, loading, applySearch, goToPage, refetch } = usePagination(fetchMaterials)

  const { data: subjectsData } = useQuery(() => subjectsApi.list({ limit: 100, isActive: true }), [])
  const { data: classesData }  = useQuery(() => classesApi.list({ limit: 100, isActive: true }), [])
  const subjectOptions = (subjectsData?.data || []).map((s) => ({ value: s._id, label: `${s.name} (${s.code})` }))
  const classOptions   = (classesData?.data  || []).map((c) => ({ value: c._id, label: `Grade ${c.grade}-${c.section}` }))

  const { mutate: deleteMaterial, loading: deleting } = useMutation((id) => materialsApi.remove(id))
  const { mutate: downloadMaterial } = useMutation((id) => materialsApi.download(id))

  const onUpload = async () => {
    if (!uploadFile)                   return toast.error('Please select a file')
    if (!uploadMeta.title.trim())      return toast.error('Title is required')
    if (!uploadMeta.subject)           return toast.error('Subject is required')

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file',         uploadFile)
      fd.append('title',        uploadMeta.title)
      fd.append('description',  uploadMeta.description)
      fd.append('subject',      uploadMeta.subject)
      fd.append('materialType', uploadMeta.materialType)
      if (uploadMeta.class)  fd.append('class', uploadMeta.class)
      if (uploadMeta.tags)   fd.append('tags',  uploadMeta.tags)

      const res = await materialsApi.upload(fd)
      if (res.data?.success) {
        toast.success('Material uploaded successfully')
        setUploadOpen(false)
        setUploadFile(null)
        setUploadMeta({ title: '', description: '', subject: '', materialType: 'notes' })
        refetch()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onDelete = async () => {
    const r = await deleteMaterial(deleteTarget._id)
    if (r.success) { toast.success('Material deleted'); setDeleteTarget(null); refetch() }
    else toast.error(r.message)
  }

  const onDownload = async (material) => {
    const r = await downloadMaterial(material._id)
    if (r.success) {
      // Open in new tab
      window.open(`http://localhost:5000${material.fileUrl}`, '_blank')
    }
  }

  const clearFilters = () => { setFilterSubject(''); setFilterType('') }
  const hasFilters = filterSubject || filterType

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <PageHeader
        title="Study Materials"
        description="Access notes, references, question papers and learning resources"
        actions={canUpload && (
          <Button leftIcon={<Upload className="h-4 w-4" />} onClick={() => setUploadOpen(true)}>
            Upload Material
          </Button>
        )}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search materials..." onSearch={applySearch} className="w-64" />
        <Select placeholder="All subjects" options={subjectOptions} value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)} className="w-52" />
        <Select placeholder="All types" options={MATERIAL_TYPES} value={filterType}
          onChange={(e) => setFilterType(e.target.value)} className="w-44" />
        {hasFilters && (
          <Button variant="ghost" size="sm" leftIcon={<X className="h-3.5 w-3.5" />} onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 p-4 space-y-3">
              <div className="flex gap-3 items-center">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800">
          <EmptyState
            icon={FileText}
            title="No materials found"
            description={canUpload ? 'Upload your first study material' : 'No materials available yet'}
            action={canUpload && (
              <Button leftIcon={<Upload className="h-4 w-4" />} onClick={() => setUploadOpen(true)}>
                Upload Material
              </Button>
            )}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {materials.map((m, i) => {
            const uploader = m.uploadedBy || {}
            const uploaderName = `${uploader.firstName || ''} ${uploader.lastName || ''}`.trim()
            return (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 p-4 hover:shadow-md hover:border-gray-200 dark:hover:border-surface-700 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <FileTypeBadge type={m.fileType} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug line-clamp-2">
                      {m.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {m.subject && <Badge variant="blue" size="sm">{m.subject.code}</Badge>}
                      <Badge variant={TYPE_COLORS[m.materialType] || 'default'} size="sm">{m.materialType}</Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {m.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                    {m.description}
                  </p>
                )}

                {/* Tags */}
                {m.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {m.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-surface-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-surface-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={uploaderName} size="xs" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{uploaderName}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-600">{formatRelativeTime(m.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">
                      {m.downloads} ↓
                    </span>
                    <Button variant="ghost" size="icon-sm" title="Download" onClick={() => onDownload(m)}>
                      <Download className="h-3.5 w-3.5 text-primary-500" />
                    </Button>
                    {canUpload && (
                      <Button variant="ghost" size="icon-sm" title="Delete" onClick={() => setDeleteTarget(m)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <Pagination pagination={{ ...pagination, limit: 12 }} onPageChange={goToPage} />
      )}

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Study Material" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={onUpload} isLoading={uploading} loadingText="Uploading...">Upload</Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* File drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
              uploadFile
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/20'
                : 'border-gray-200 dark:border-surface-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-surface-800'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files[0] || null)}
            />
            {uploadFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileTypeBadge type={uploadFile.name.split('.').pop()?.toLowerCase() || 'other'} />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{uploadFile.name}</p>
                  <p className="text-xs text-gray-500">{(uploadFile.size / 1048576).toFixed(2)} MB</p>
                </div>
                <button className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setUploadFile(null) }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to select a file
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  PDF, Word, PowerPoint, Images, Video — max 10MB
                </p>
              </>
            )}
          </div>

          <Input
            label="Title" required placeholder="e.g. Chapter 5 — Quadratic Equations Notes"
            value={uploadMeta.title}
            onChange={(e) => setUploadMeta((p) => ({ ...p, title: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Subject" required placeholder="Select subject..." options={subjectOptions}
              value={uploadMeta.subject}
              onChange={(e) => setUploadMeta((p) => ({ ...p, subject: e.target.value }))}
            />
            <Select
              label="Material Type" options={MATERIAL_TYPES}
              value={uploadMeta.materialType}
              onChange={(e) => setUploadMeta((p) => ({ ...p, materialType: e.target.value }))}
            />
          </div>

          <Select
            label="Class (optional)" placeholder="All classes" options={classOptions}
            value={uploadMeta.class || ''}
            onChange={(e) => setUploadMeta((p) => ({ ...p, class: e.target.value }))}
          />

          <Input
            label="Description" placeholder="Brief description of this material..."
            value={uploadMeta.description}
            onChange={(e) => setUploadMeta((p) => ({ ...p, description: e.target.value }))}
          />

          <Input
            label="Tags (comma-separated)" placeholder="algebra, equations, chapter5"
            value={uploadMeta.tags || ''}
            onChange={(e) => setUploadMeta((p) => ({ ...p, tags: e.target.value }))}
            hint="Helps students search for this material"
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete Material"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
