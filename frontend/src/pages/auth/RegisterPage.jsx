import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Phone, ChevronDown, ArrowRight } from 'lucide-react'

import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import useAuthStore from '@/store/authStore'
import { cn } from '@/lib/utils'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'teacher', 'student', 'parent']).default('student'),
  password: z
    .string()
    .regex(
      passwordRegex,
      'Password must have uppercase, lowercase, number and special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'parent', label: 'Parent' },
  { value: 'admin', label: 'Administrator' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, isAuthenticated, isLoading, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  })

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
    return () => clearError()
  }, [isAuthenticated])

  const onSubmit = async (data) => {
    const { confirmPassword, ...payload } = data
    const result = await registerUser(payload)

    if (result.success) {
      toast.success('Account created successfully!')
      navigate('/dashboard', { replace: true })
    } else {
      toast.error(result.message || 'Registration failed')
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join EduFlow and transform your academic experience"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="John"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.firstName?.message}
            autoComplete="given-name"
            required
            {...register('firstName')}
          />
          <Input
            label="Last name"
            placeholder="Doe"
            error={errors.lastName?.message}
            autoComplete="family-name"
            required
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="you@school.edu"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          required
          {...register('email')}
        />

        <Input
          label="Phone number"
          type="tel"
          placeholder="+1 (555) 000-0000"
          leftIcon={<Phone className="h-4 w-4" />}
          error={errors.phone?.message}
          hint="Optional"
          {...register('phone')}
        />

        {/* Role Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              className={cn(
                'w-full h-10 rounded-xl border text-sm appearance-none',
                'bg-white dark:bg-surface-900',
                'text-gray-900 dark:text-gray-100',
                'border-gray-200 dark:border-surface-700',
                'hover:border-gray-300 dark:hover:border-surface-600',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
                'pl-3.5 pr-9',
                'transition-all duration-150',
                errors.role && 'border-red-400'
              )}
              {...register('role')}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.role && (
            <p className="text-xs text-red-600">{errors.role.message}</p>
          )}
        </div>

        <Input
          label="Password"
          type="password"
          placeholder="Min 8 chars with special character"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          autoComplete="new-password"
          required
          {...register('password')}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          required
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
          loadingText="Creating account..."
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
