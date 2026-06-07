import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      type = 'text',
      className,
      containerClassName,
      required,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={cn(
              'w-full h-10 rounded-xl border text-sm',
              'bg-white dark:bg-surface-900',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-600',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
                : 'border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600',
              leftIcon ? 'pl-9' : 'pl-3.5',
              isPassword || rightIcon ? 'pr-10' : 'pr-3.5',
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {!isPassword && rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-500">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
