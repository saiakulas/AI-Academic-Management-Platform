import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, Bell, Shield, Palette, Globe } from 'lucide-react'
import useThemeStore from '@/store/themeStore'
import useAuthStore from '@/store/authStore'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { ROLE_META, cn } from '@/lib/utils'

const THEME_OPTIONS = [
  { value: 'light',  label: 'Light',  icon: Sun     },
  { value: 'dark',   label: 'Dark',   icon: Moon    },
  { value: 'system', label: 'System', icon: Monitor },
]

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 dark:border-surface-800 last:border-0 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary-500',
        checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-surface-700'
      )}
    >
      <span className={cn(
        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
        checked ? 'translate-x-6' : 'translate-x-1'
      )} />
    </button>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore()
  const { user } = useAuthStore()
  const roleMeta = ROLE_META[user?.role] || {}

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in-up max-w-2xl">
      <PageHeader
        title="Settings"
        description="Manage your preferences and account configuration"
      />

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <SettingRow label="Theme" description="Choose your preferred colour scheme">
              <div className="flex gap-1.5">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                      theme === value
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600 bg-white dark:bg-surface-900'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </SettingRow>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications (UI only — Phase 4) */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <SettingRow label="Email notifications" description="Receive updates about assignments and results">
              <Toggle checked={true} onChange={() => {}} />
            </SettingRow>
            <SettingRow label="Notice announcements" description="Get notified when new notices are posted">
              <Toggle checked={true} onChange={() => {}} />
            </SettingRow>
            <SettingRow label="Attendance alerts" description="Receive low attendance warnings">
              <Toggle checked={false} onChange={() => {}} />
            </SettingRow>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <CardTitle>Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <SettingRow label="Email address" description={user?.email}>
              <Badge variant="success" size="sm">Verified</Badge>
            </SettingRow>
            <SettingRow label="Role" description={roleMeta.description}>
              <Badge variant={roleMeta.badge || 'default'}>{roleMeta.label || user?.role}</Badge>
            </SettingRow>
            <SettingRow label="Two-factor authentication" description="Add an extra layer of security (Phase 4)">
              <Badge variant="warning" size="sm">Coming soon</Badge>
            </SettingRow>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language (UI only) */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <CardTitle>Language & Region</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <SettingRow label="Language" description="Interface language">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">English (US)</span>
            </SettingRow>
            <SettingRow label="Date format" description="How dates are displayed">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">MMM DD, YYYY</span>
            </SettingRow>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
