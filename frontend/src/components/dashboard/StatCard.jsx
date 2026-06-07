import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: 'bg-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    icon: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
  },
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-950/30',
    icon: 'bg-primary-500',
    text: 'text-primary-600 dark:text-primary-400',
  },
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend, trendValue, delay = 0 }) {
  const colors = colorMap[color] || colorMap.primary

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-red-500' : 'text-gray-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 p-6 hover:shadow-md hover:border-gray-200 dark:hover:border-surface-700 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{value}</p>
          {(subtitle || trendValue) && (
            <div className="flex items-center gap-2">
              {trendValue && (
                <span className={cn('flex items-center gap-1 text-xs font-semibold', trendColor)}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {trendValue}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0', colors.bg)}>
          <Icon className={cn('h-6 w-6', colors.text)} />
        </div>
      </div>
    </motion.div>
  )
}
