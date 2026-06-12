import { motion } from 'framer-motion'
import { ClipboardList, UserPlus, Bell, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

const ACTIVITIES = [
  {
    id: 1,
    type: 'assignment',
    icon: ClipboardList,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    title: 'New assignment posted',
    desc: 'Mathematics – Chapter 5 Exercises due Friday',
    user: 'Ms. Rachel Green',
    time: '2 min ago',
  },
  {
    id: 2,
    type: 'student',
    icon: UserPlus,
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    title: 'Student enrolled',
    desc: 'James Wilson joined Grade 10-A',
    user: 'Admin',
    time: '15 min ago',
  },
  {
    id: 3,
    type: 'notice',
    icon: Bell,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    title: 'Notice published',
    desc: 'Annual Sports Day – November 25th',
    user: 'Principal Office',
    time: '1 hour ago',
  },
  {
    id: 4,
    type: 'material',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    title: 'Study material uploaded',
    desc: 'Physics – Electromagnetism Notes PDF',
    user: 'Mr. David Chen',
    time: '2 hours ago',
  },
  {
    id: 5,
    type: 'result',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    title: 'Results published',
    desc: 'Midterm exam results for Grade 9',
    user: 'Examination Cell',
    time: '5 hours ago',
  },
]

export default function RecentActivity() {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-surface-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
        <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
          View all
        </button>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-surface-800">
        {ACTIVITIES.map((activity, i) => {
          const Icon = activity.icon
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
            >
              <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', activity.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{activity.desc}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Avatar name={activity.user} size="xs" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">{activity.user}</span>
                  <span className="text-xs text-gray-300 dark:text-gray-700">·</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
