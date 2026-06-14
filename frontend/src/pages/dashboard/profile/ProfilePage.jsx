import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { User, Phone, Mail, Shield, Camera, Key, CheckCircle2 } from 'lucide-react'

import { profileApi } from '@/api/profile.api'
import { useMutation } from '@/hooks/useQuery'
import useAuthStore from '@/store/authStore'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { ROLE_META, formatDate } from '@/lib/utils'

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName:  z.string().min(2, 'Last name must be at least 2 characters'),
  phone:     z.string().optional(),
})

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().regex(passwordRegex, 'Must include uppercase, lowercase, number and special character'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-surface-800 last:border-0">
      <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [pwSuccess, setPwSuccess] = useState(false)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName:  user?.lastName  || '',
      phone:     user?.phone     || '',
    },
  })

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) })

  const { mutate: updateProfile, loading: savingProfile } = useMutation((d) => profileApi.update(d))
  const { mutate: changePassword, loading: changingPw } = useMutation((d) => profileApi.changePassword(d))

  const onSaveProfile = async (data) => {
    const result = await updateProfile(data)
    if (result.success) {
      updateUser(result.data.user)
      toast.success('Profile updated successfully')
    } else {
      toast.error(result.message)
    }
  }

  const onChangePassword = async (data) => {
    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword:     data.newPassword,
      confirmPassword: data.confirmPassword,
    })
    if (result.success) {
      setPwSuccess(true)
      passwordForm.reset()
      toast.success('Password changed. Please log in again.')
    } else {
      toast.error(result.message)
    }
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : ''
  const roleMeta = ROLE_META[user?.role] || {}

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and account security"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left: Identity card ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
              {/* Avatar with change button */}
              <div className="relative mb-4">
                <Avatar name={fullName} src={user?.avatar} size="2xl" />
                <button className="absolute bottom-0 right-0 h-7 w-7 bg-primary-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-900 hover:bg-primary-700 transition-colors">
                  <Camera className="h-3.5 w-3.5 text-white" />
                </button>
              </div>

              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{fullName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>

              <div className="mt-3 flex items-center gap-2">
                <Badge variant={roleMeta.badge || 'default'} size="md">
                  {roleMeta.label || user?.role}
                </Badge>
                {user?.isEmailVerified && (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="h-3 w-3 mr-1" />Verified
                  </Badge>
                )}
              </div>

              <div className="mt-5 w-full text-left">
                <InfoRow icon={Mail}   label="Email Address" value={user?.email} />
                <InfoRow icon={Phone}  label="Phone"         value={user?.phone} />
                <InfoRow icon={Shield} label="Role"          value={roleMeta.description || user?.role} />
                <InfoRow icon={User}   label="Member Since"  value={formatDate(user?.createdAt)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Right: Forms ─────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">
          {/* Edit profile */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First name" required
                      error={profileForm.formState.errors.firstName?.message}
                      {...profileForm.register('firstName')}
                    />
                    <Input
                      label="Last name" required
                      error={profileForm.formState.errors.lastName?.message}
                      {...profileForm.register('lastName')}
                    />
                  </div>
                  <Input
                    label="Phone number"
                    placeholder="+1 (555) 000-0000"
                    hint="Optional"
                    {...profileForm.register('phone')}
                  />
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      isLoading={savingProfile}
                      loadingText="Saving..."
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change password */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <CardTitle>Change Password</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {pwSuccess ? (
                  <div className="flex flex-col items-center py-6 gap-3">
                    <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Password changed successfully</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">You'll be redirected to login shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4" noValidate>
                    <Input
                      label="Current password" type="password" required
                      placeholder="Enter your current password"
                      error={passwordForm.formState.errors.currentPassword?.message}
                      {...passwordForm.register('currentPassword')}
                    />
                    <Input
                      label="New password" type="password" required
                      placeholder="Min 8 chars with uppercase, number, special char"
                      error={passwordForm.formState.errors.newPassword?.message}
                      {...passwordForm.register('newPassword')}
                    />
                    <Input
                      label="Confirm new password" type="password" required
                      placeholder="Repeat new password"
                      error={passwordForm.formState.errors.confirmPassword?.message}
                      {...passwordForm.register('confirmPassword')}
                    />
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="danger"
                        isLoading={changingPw}
                        loadingText="Updating..."
                      >
                        Update Password
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
