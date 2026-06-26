import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute, { GuestRoute } from '@/components/common/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { useAuthInit } from '@/hooks/useAuth'
import useAuthStore from '@/store/authStore'

// ── Auth ──────────────────────────────────────────────────────────
const LoginPage    = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

// ── Dashboard ─────────────────────────────────────────────────────
const DashboardPage   = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ParentDashboard = lazy(() => import('@/pages/dashboard/parent/ParentDashboard'))

// ── Phase 2 pages ─────────────────────────────────────────────────
const StudentsPage    = lazy(() => import('@/pages/dashboard/students/StudentsPage'))
const TeachersPage    = lazy(() => import('@/pages/dashboard/teachers/TeachersPage'))
const ClassesPage     = lazy(() => import('@/pages/dashboard/classes/ClassesPage'))
const SubjectsPage    = lazy(() => import('@/pages/dashboard/subjects/SubjectsPage'))
const AttendancePage  = lazy(() => import('@/pages/dashboard/attendance/AttendancePage'))
const AssignmentsPage = lazy(() => import('@/pages/dashboard/assignments/AssignmentsPage'))
const NoticesPage     = lazy(() => import('@/pages/dashboard/notices/NoticesPage'))

// ── Phase 3 pages ─────────────────────────────────────────────────
const ResultsPage   = lazy(() => import('@/pages/dashboard/results/ResultsPage'))
const MaterialsPage = lazy(() => import('@/pages/dashboard/materials/MaterialsPage'))
const ProfilePage   = lazy(() => import('@/pages/dashboard/profile/ProfilePage'))
const SettingsPage  = lazy(() => import('@/pages/dashboard/settings/SettingsPage'))

// ── Timetable ─────────────────────────────────────────────────────
const TimetablePage = lazy(() => import('@/pages/dashboard/timetable/TimetablePage'))

// ── Errors ────────────────────────────────────────────────────────
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'))

/**
 * Smart index component: renders the parent-specific dashboard for
 * the 'parent' role, the standard dashboard for all other roles.
 */
function DashboardIndex() {
  const role = useAuthStore((s) => s.user?.role)
  if (role === 'parent') return <ParentDashboard />
  return <DashboardPage />
}

export default function App() {
  useAuthInit()

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── Guest routes ──────────────────────────────────────── */}
        <Route path="/auth/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/auth/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* ── Protected dashboard ───────────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Role-aware index: admin/teacher/student → DashboardPage, parent → ParentDashboard */}
          <Route index element={<DashboardIndex />} />

          {/* ── People (Phase 2) ──────────────────────────────── */}
          <Route
            path="students"
            element={
              <ProtectedRoute roles={['admin', 'teacher']}>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="teachers"
            element={
              <ProtectedRoute roles={['admin']}>
                <TeachersPage />
              </ProtectedRoute>
            }
          />

          {/* ── Academics (Phase 2) ────────────────────────────── */}
          <Route
            path="classes"
            element={
              <ProtectedRoute roles={['admin', 'teacher', 'student']}>
                <ClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="subjects"
            element={
              <ProtectedRoute roles={['admin', 'teacher', 'student']}>
                <SubjectsPage />
              </ProtectedRoute>
            }
          />
          <Route path="assignments" element={<AssignmentsPage />} />

          {/* ── Monitoring ────────────────────────────────────── */}
          <Route path="attendance" element={<AttendancePage />} />

          {/* ── Results (Phase 3) ─────────────────────────────── */}
          <Route path="results" element={<ResultsPage />} />

          {/* ── Study Materials (Phase 3) ─────────────────────── */}
          <Route
            path="materials"
            element={
              <ProtectedRoute roles={['admin', 'teacher', 'student']}>
                <MaterialsPage />
              </ProtectedRoute>
            }
          />

          {/* ── Timetable ─────────────────────────────────────── */}
          <Route
            path="timetable"
            element={
              <ProtectedRoute roles={['admin', 'teacher', 'student']}>
                <TimetablePage />
              </ProtectedRoute>
            }
          />

          {/* ── Communication ─────────────────────────────────── */}
          <Route path="notices" element={<NoticesPage />} />

          {/* ── Account (Phase 3) ─────────────────────────────── */}
          <Route path="profile"  element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
