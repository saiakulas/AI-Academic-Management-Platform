import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-gray-100 text-gray-700 dark:bg-surface-800 dark:text-gray-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const sizes = {
  sm: 'text-xs px-2 py-0.5 rounded-md',
  md: 'text-xs px-2.5 py-1 rounded-lg',
  lg: 'text-sm px-3 py-1 rounded-lg',
}

export default function Badge({ children, variant = 'default', size = 'md', className, dot = false, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', getDotColor(variant))} />
      )}
      {children}
    </span>
  )
}

function getDotColor(variant) {
  const dots = {
    default: 'bg-gray-500',
    primary: 'bg-primary-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
  }
  return dots[variant] || dots.default
}
