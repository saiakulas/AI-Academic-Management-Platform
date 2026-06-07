import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-surface-950">
      {/* ─── Left Panel (Brand) ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between bg-primary-600 p-12 relative overflow-hidden shrink-0">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full -translate-y-1/2 translate-x-1/3 opacity-40" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-700 rounded-full translate-y-1/3 -translate-x-1/4 opacity-50" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">EduFlow</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10 space-y-6"
        >
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Academic Excellence,{' '}
              <span className="text-primary-200">Reimagined.</span>
            </h1>
            <p className="text-primary-200 text-lg leading-relaxed">
              The modern platform powering the next generation of educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Active Students', value: '12,400+' },
              { label: 'Institutions', value: '240+' },
              { label: 'Assignments', value: '98k+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20"
              >
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-primary-200 text-sm mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10">
          <p className="text-primary-300 text-sm">
            © 2024 EduFlow. Enterprise Academic Platform.
          </p>
        </div>
      </div>

      {/* ─── Right Panel (Form) ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2.5">
          <div className="h-9 w-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">EduFlow</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-8 space-y-1.5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</p>
            )}
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  )
}
