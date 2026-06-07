import { motion } from 'framer-motion'
import { Construction, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function PlaceholderPage({ title = 'Coming Soon', description }) {
  return (
    <div className="p-6 lg:p-8 animate-fade-in-up">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 mb-6">
          <Construction className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-sm">
          {description || 'This module is part of the EduFlow roadmap and will be available soon.'}
        </p>
        <div className="mt-6">
          <Link to="/dashboard">
            <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
