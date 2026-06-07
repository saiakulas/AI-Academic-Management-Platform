import { cn } from '@/lib/utils'

const sizes = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-12 w-12 border-4',
}

export default function Spinner({ size = 'md', className, label = 'Loading...' }) {
  return (
    <div role="status" className={cn('inline-flex', className)}>
      <div
        className={cn(
          'rounded-full border-gray-200 border-t-primary-600 animate-spin',
          'dark:border-surface-700 dark:border-t-primary-400',
          sizes[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-surface-950/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading EduFlow...</p>
      </div>
    </div>
  )
}
