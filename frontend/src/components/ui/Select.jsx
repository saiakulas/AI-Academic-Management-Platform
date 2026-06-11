import { forwardRef } from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const Select = forwardRef(({ label, error, options = [], placeholder, className, containerClassName, required, ...props }, ref) => {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full h-10 rounded-xl border text-sm appearance-none',
            'bg-white dark:bg-surface-900',
            'text-gray-900 dark:text-gray-100',
            'pl-3.5 pr-9',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
