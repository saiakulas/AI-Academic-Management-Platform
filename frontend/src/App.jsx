import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute, { GuestRoute } from '@/components/common/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { useAuthInit } from '@/hooks/useAuth'

// Lazy-loaded pages
const LoginPage       = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage    = lazy(() => import('@/pages/auth/RegisterPage'))
const DashboardPage   = lazy(() => import('@/pages/dashboard/DashboardPage'))
const PlaceholderPage = lazy(() => import('@/pages/dashboard/PlaceholderPage'))
const NotFoundPage    = lazy(() => import('@/pages/errors/NotFoundPage'))

export default function App() {
  // Fires exactly once: verifies session via /auth/me, sets isInitialized
  useAuthInit()

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        {/* Root → dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── Guest-only auth routes ───────────────────────── */}
        <Route path="/auth/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/auth/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* ── Protected dashboard routes ───────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          {/* Academics */}
          <Route path="students"   element={<PlaceholderPage title="Students"       description="Manage student profiles, enrollment and academic records." />} />
          <Route path="teachers"   element={<PlaceholderPage title="Teachers"       description="Manage teacher profiles, assignments and performance." />} />
          <Route path="classes"    element={<PlaceholderPage title="Classes"        description="Manage class schedules, sections and assignments." />} />
          <Route path="subjects"   element={<PlaceholderPage title="Subjects"       description="Manage subjects, syllabi and curriculum." />} />

          {/* Activities */}
          <Route path="attendance"  element={<PlaceholderPage title="Attendance"      description="Track and manage student and staff attendance." />} />
          <Route path="assignments" element={<PlaceholderPage title="Assignments"     description="Create, assign and grade student assignments." />} />
          <Route path="materials"   element={<PlaceholderPage title="Study Materials" description="Upload and manage notes, PDFs and resources." />} />

          {/* Reports */}
          <Route path="results"  element={<PlaceholderPage title="Results & Performance"   description="Publish exam results and academic performance reports." />} />
          <Route path="notices"  element={<PlaceholderPage title="Notices & Announcements" description="Broadcast notices and announcements to the institution." />} />

          {/* System */}
          <Route path="settings" element={<PlaceholderPage title="Settings"   description="Configure platform settings, roles and preferences." />} />
          <Route path="profile"  element={<PlaceholderPage title="My Profile" description="View and update your personal account information." />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
