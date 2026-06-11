import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute, { GuestRoute } from '@/components/common/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { useAuthInit } from '@/hooks/useAuth'

// ── Auth pages ────────────────────────────────────────────────────
const LoginPage    = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

// ── Dashboard pages ───────────────────────────────────────────────
const DashboardPage    = lazy(() => import('@/pages/dashboard/DashboardPage'))
const StudentsPage     = lazy(() => import('@/pages/dashboard/students/StudentsPage'))
const TeachersPage     = lazy(() => import('@/pages/dashboard/teachers/TeachersPage'))
const ClassesPage      = lazy(() => import('@/pages/dashboard/classes/ClassesPage'))
const SubjectsPage     = lazy(() => import('@/pages/dashboard/subjects/SubjectsPage'))
const AttendancePage   = lazy(() => import('@/pages/dashboard/attendance/AttendancePage'))
const AssignmentsPage  = lazy(() => import('@/pages/dashboard/assignments/AssignmentsPage'))
const NoticesPage      = lazy(() => import('@/pages/dashboard/notices/NoticesPage'))
const PlaceholderPage  = lazy(() => import('@/pages/dashboard/PlaceholderPage'))
const NotFoundPage     = lazy(() => import('@/pages/errors/NotFoundPage'))

export default function App() {
  useAuthInit()

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── Guest routes ─────────────────────────────── */}
        <Route path="/auth/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/auth/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* ── Protected dashboard routes ────────────────── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />

          {/* Academics */}
          <Route path="students"   element={<ProtectedRoute roles={['admin','teacher']}><StudentsPage /></ProtectedRoute>} />
          <Route path="teachers"   element={<ProtectedRoute roles={['admin']}><TeachersPage /></ProtectedRoute>} />
          <Route path="classes"    element={<ProtectedRoute roles={['admin','teacher','student']}><ClassesPage /></ProtectedRoute>} />
          <Route path="subjects"   element={<ProtectedRoute roles={['admin','teacher','student']}><SubjectsPage /></ProtectedRoute>} />

          {/* Activities */}
          <Route path="attendance"  element={<AttendancePage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="materials"   element={<PlaceholderPage title="Study Materials" description="Upload and manage notes, PDFs and learning resources. Coming in Phase 3." />} />

          {/* Reports */}
          <Route path="results"  element={<PlaceholderPage title="Results & Performance" description="Publish and view academic results and analytics. Coming in Phase 3." />} />
          <Route path="notices"  element={<NoticesPage />} />

          {/* System */}
          <Route path="settings" element={<PlaceholderPage title="Settings" description="Configure platform settings, roles and preferences. Coming in Phase 3." />} />
          <Route path="profile"  element={<PlaceholderPage title="My Profile" description="View and edit your profile information. Coming in Phase 3." />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
