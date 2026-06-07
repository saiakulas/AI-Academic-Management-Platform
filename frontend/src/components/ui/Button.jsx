import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md',
  secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm dark:bg-surface-800 dark:text-gray-200 dark:border-surface-700 dark:hover:bg-surface-700',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-800 dark:hover:text-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  outline: 'border border-primary-500 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950',
}

const sizes = {
  xs: 'h-7 px-3 text-xs rounded-md gap-1.5',
  sm: 'h-8 px-3.5 text-sm rounded-lg gap-2',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-11 px-6 text-base rounded-xl gap-2.5',
  xl: 'h-12 px-8 text-base rounded-2xl gap-3',
  icon: 'h-10 w-10 rounded-xl',
  'icon-sm': 'h-8 w-8 rounded-lg',
}

const Button = forwardRef(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
