import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', loading = false, danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} isLoading={loading} loadingText="Processing...">
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
          <AlertTriangle className={`h-5 w-5 ${danger ? 'text-red-600 dark:text-red-400' : 'text-primary-600 dark:text-primary-400'}`} />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-1.5">{message}</p>
      </div>
    </Modal>
  )
}
