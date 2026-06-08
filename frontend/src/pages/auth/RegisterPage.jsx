import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Phone, ChevronDown, ArrowRight, Info } from 'lucide-react'

import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import useAuthStore from '@/store/authStore'
import { cn, ROLE_META } from '@/lib/utils'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName:  z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email:     z.string().email('Please enter a valid email address'),
  phone:     z.string().optional(),
  role:      z.enum(['teacher', 'student']).default('student'),
  password:  z
    .string()
    .regex(passwordRegex, 'Must include uppercase, lowercase, number and special character'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Only roles that can self-register publicly
const REGISTERABLE_ROLES = Object.entries(ROLE_META)
  .filter(([, meta]) => meta.canRegister)
  .map(([value, meta]) => ({ value, label: meta.label, description: meta.description }))

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, isAuthenticated, isLoading, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  })

  const selectedRole = watch('role')

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
    return () => clearError()
  }, [isAuthenticated])

  const onSubmit = async (data) => {
    const { confirmPassword, ...payload } = data
    const result = await registerUser(payload)

    if (result.success) {
      toast.success('Account created! Welcome to EduFlow.')
      navigate('/dashboard', { replace: true })
    } else {
      toast.error(result.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join EduFlow as a teacher or student"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name */}
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

        {/* Email */}
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

        {/* Phone */}
        <Input
          label="Phone number"
          type="tel"
          placeholder="+1 (555) 000-0000"
          leftIcon={<Phone className="h-4 w-4" />}
          hint="Optional"
          {...register('phone')}
        />

        {/* Role selector — only teacher / student */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            I am a <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {REGISTERABLE_ROLES.map((r) => (
              <label
                key={r.value}
                className={cn(
                  'flex flex-col gap-0.5 p-3 rounded-xl border cursor-pointer transition-all',
                  selectedRole === r.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 dark:border-primary-400'
                    : 'border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600'
                )}
              >
                <input
                  type="radio"
                  value={r.value}
                  className="sr-only"
                  {...register('role')}
                />
                <span className={cn(
                  'text-sm font-semibold',
                  selectedRole === r.value
                    ? 'text-primary-700 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300'
                )}>
                  {r.label}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 leading-snug">
                  {r.description}
                </span>
              </label>
            ))}
          </div>
          {errors.role && (
            <p className="text-xs text-red-600">{errors.role.message}</p>
          )}
        </div>

        {/* Admin/parent note */}
        <div className="flex gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong>Admin & Parent</strong> accounts are created by your institution administrator
            — they cannot self-register. Contact your school office if you need access.
          </p>
        </div>

        {/* Password */}
        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 chars with special character"
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
