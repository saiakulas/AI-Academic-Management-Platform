import { cn } from '@/lib/utils'

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800',
        'shadow-sm',
        hover && 'hover:shadow-md hover:border-gray-200 dark:hover:border-surface-700 transition-all duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn('text-base font-semibold text-gray-900 dark:text-gray-100', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-gray-100 dark:border-surface-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
