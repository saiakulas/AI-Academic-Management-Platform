import { cn } from '@/lib/utils'

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('skeleton rounded-lg', className)}
      {...props}
    />
  )
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 p-6 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

export function SkeletonAvatar({ size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }
  return <Skeleton className={cn('rounded-full', sizes[size])} />
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
    </div>
  )
}
