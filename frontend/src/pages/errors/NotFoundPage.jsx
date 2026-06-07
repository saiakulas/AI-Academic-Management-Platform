import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { GraduationCap, Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-surface-950 p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 max-w-md"
      >
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-100 dark:bg-primary-950/50">
          <GraduationCap className="h-10 w-10 text-primary-600 dark:text-primary-400" />
        </div>

        <div className="space-y-2">
          <p className="text-8xl font-bold text-gray-200 dark:text-surface-800 leading-none">404</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Page not found</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => history.back()}>
            Go back
          </Button>
          <Link to="/dashboard">
            <Button leftIcon={<Home className="h-4 w-4" />}>Dashboard</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
