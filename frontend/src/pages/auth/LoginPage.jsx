import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, Lock, ArrowRight } from 'lucide-react'

import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import useAuthStore from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading, clearError } = useAuthStore()
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
    return () => clearError()
  }, [isAuthenticated])

  const onSubmit = async (data) => {
    const result = await login(data)

    if (result.success) {
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } else {
      if (result.message?.includes('password')) {
        setError('password', { message: result.message })
      } else if (result.message?.includes('email')) {
        setError('email', { message: result.message })
      } else {
        toast.error(result.message || 'Login failed')
      }
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your EduFlow account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

        <div className="space-y-1.5">
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            autoComplete="current-password"
            required
            {...register('password')}
          />
          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
          loadingText="Signing in..."
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign in
        </Button>

        {/* Demo credentials */}
        <div className="rounded-xl bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-surface-700 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2.5">
            Demo Accounts
          </p>
          <div className="space-y-1.5">
            {[
              { role: 'Admin', email: 'admin@eduflow.com' },
              { role: 'Teacher', email: 'teacher@eduflow.com' },
              { role: 'Student', email: 'student@eduflow.com' },
            ].map(({ role, email }) => (
              <div key={role} className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">{role}</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">{email}</span>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-1.5">Password: Demo@1234</p>
          </div>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link
          to="/auth/register"
          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
