import { cn } from '@/lib/utils'

export function Table({ children, className }) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  )
}

export function Thead({ children }) {
  return (
    <thead className="bg-gray-50 dark:bg-surface-800 border-b border-gray-100 dark:border-surface-700">
      {children}
    </thead>
  )
}

export function Tbody({ children }) {
  return (
    <tbody className="divide-y divide-gray-50 dark:divide-surface-800">{children}</tbody>
  )
}

export function Th({ children, className }) {
  return (
    <th className={cn('px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap', className)}>
      {children}
    </th>
  )
}

export function Td({ children, className }) {
  return (
    <td className={cn('px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap', className)}>
      {children}
    </td>
  )
}

export function Tr({ children, className, onClick }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors duration-100',
        onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-surface-800/50',
        className
      )}
    >
      {children}
    </tr>
  )
}
