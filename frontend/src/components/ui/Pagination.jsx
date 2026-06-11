import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from './Button'

export default function Pagination({ pagination, onPageChange }) {
  const { page, pages, total, limit } = pagination
  if (!pages || pages <= 1) return null

  const from = (page - 1) * limit + 1
  const to   = Math.min(page * limit, total)

  // Build page number array with ellipsis
  const getPages = () => {
    const delta = 1
    const range = []
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i)
    }
    if (page - delta > 2) range.unshift('...')
    if (page + delta < pages - 1) range.push('...')
    range.unshift(1)
    if (pages > 1) range.push(pages)
    return range
  }

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium text-gray-700 dark:text-gray-300">{from}–{to}</span> of{' '}
        <span className="font-medium text-gray-700 dark:text-gray-300">{total}</span> results
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPages().map((p, i) => (
          p === '...'
            ? <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
            : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-800'
                )}
              >
                {p}
              </button>
            )
        ))}

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
