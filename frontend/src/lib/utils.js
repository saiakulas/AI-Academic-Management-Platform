import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes safely (handles conflicts)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to human-readable string
 */
export function formatDate(date, options = {}) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(date))
}

/**
 * Format relative time (e.g. "2 hours ago")
 */
export function formatRelativeTime(date) {
  if (!date) return '—'
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diff = (new Date(date) - new Date()) / 1000
  const units = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ]
  for (const { unit, seconds } of units) {
    const value = Math.round(diff / seconds)
    if (Math.abs(value) >= 1) return rtf.format(value, unit)
  }
  return 'just now'
}

/**
 * Get user initials from name
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncate text
 */
export function truncate(str, length = 50) {
  if (!str || str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Role badge color mapping
 */
export const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  student: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  parent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

/**
 * Debounce utility
 */
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
