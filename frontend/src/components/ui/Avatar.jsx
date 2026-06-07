import { cn, getInitials } from '@/lib/utils'

const sizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-20 w-20 text-2xl',
}

const colors = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-pink-500',
]

function getColorFromName(name = '') {
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export default function Avatar({ src, name, size = 'md', className, online, ...props }) {
  const initials = getInitials(name)
  const bgColor = getColorFromName(name)

  return (
    <div className={cn('relative inline-flex shrink-0', className)} {...props}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center',
          'font-semibold text-white select-none',
          sizes[size],
          !src && bgColor
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name || 'Avatar'}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-surface-900',
            online ? 'bg-emerald-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  )
}
