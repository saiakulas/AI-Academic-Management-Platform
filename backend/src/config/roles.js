/**
 * EduFlow RBAC — Role definitions and permission matrix
 *
 * Role hierarchy (highest → lowest):
 *   admin > teacher > student > parent
 *
 * admin  — Institution principal / director.
 *          Full system access. Created via seed or admin invite only.
 *          Cannot self-register through the public API.
 *
 * teacher — Faculty / staff member.
 *           Can self-register. Manages classes, assignments, attendance.
 *
 * student — Enrolled learner.
 *           Can self-register. Read-only access to own academic data.
 *
 * parent  — Guardian linked to one or more students.
 *           Cannot self-register. Created and linked by admin only.
 *           Read-only view of their child's academic data.
 */

const ROLES = Object.freeze({
  ADMIN:   'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT:  'parent',
});

/**
 * Roles that are allowed via the public /register endpoint.
 * admin  → must be created by seed or admin invite
 * parent → must be created by admin (linked to a student)
 */
const PUBLIC_REGISTER_ROLES = [ROLES.TEACHER, ROLES.STUDENT];

/**
 * Roles that can only be created by an authenticated admin.
 */
const ADMIN_ONLY_CREATE_ROLES = [ROLES.ADMIN, ROLES.PARENT];

/**
 * Permission matrix — what each role can do at the route level.
 * Used by the authorize() middleware.
 */
const PERMISSIONS = {
  // Dashboard
  viewDashboard: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],

  // User management (admin only)
  manageUsers:   [ROLES.ADMIN],
  viewAllUsers:  [ROLES.ADMIN],

  // Teacher management
  manageTeachers: [ROLES.ADMIN],
  viewTeachers:   [ROLES.ADMIN],

  // Student management
  manageStudents: [ROLES.ADMIN, ROLES.TEACHER],
  viewStudents:   [ROLES.ADMIN, ROLES.TEACHER],

  // Class & Subject management
  manageClasses:  [ROLES.ADMIN],
  viewClasses:    [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
  manageSubjects: [ROLES.ADMIN],
  viewSubjects:   [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],

  // Attendance
  markAttendance:  [ROLES.ADMIN, ROLES.TEACHER],
  viewAttendance:  [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],

  // Assignments
  manageAssignments: [ROLES.ADMIN, ROLES.TEACHER],
  submitAssignment:  [ROLES.STUDENT],
  viewAssignments:   [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],

  // Study Materials
  uploadMaterials: [ROLES.ADMIN, ROLES.TEACHER],
  viewMaterials:   [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],

  // Results
  publishResults: [ROLES.ADMIN, ROLES.TEACHER],
  viewResults:    [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],

  // Notices
  publishNotices: [ROLES.ADMIN, ROLES.TEACHER],
  viewNotices:    [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],

  // System settings — admin only
  manageSettings: [ROLES.ADMIN],
};

module.exports = { ROLES, PUBLIC_REGISTER_ROLES, ADMIN_ONLY_CREATE_ROLES, PERMISSIONS };
