import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

export default function SearchInput({
  placeholder = 'Search...',
  onSearch,
  className,
  debounce = 400,
  defaultValue = '',
}) {
  const [value, setValue] = useState(defaultValue)
  const debounced = useDebounce(value, debounce)

  useEffect(() => {
    onSearch(debounced)
  }, [debounced]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full pl-9 pr-8 rounded-xl border text-sm',
          'bg-white dark:bg-surface-900',
          'text-gray-900 dark:text-gray-100',
          'placeholder:text-gray-400 dark:placeholder:text-gray-600',
          'border-gray-200 dark:border-surface-700',
          'hover:border-gray-300 dark:hover:border-surface-600',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
          'transition-all duration-150'
        )}
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
