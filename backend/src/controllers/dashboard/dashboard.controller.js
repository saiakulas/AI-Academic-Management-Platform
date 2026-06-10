const dashboardService = require('../../services/dashboard.service');
const ApiResponse      = require('../../utils/ApiResponse');
const asyncHandler     = require('../../utils/asyncHandler');

/**
 * GET /api/v1/dashboard
 * Returns role-specific dashboard data for the authenticated user.
 */
const getDashboard = asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user;
  let data;

  switch (role) {
    case 'admin':
      data = await dashboardService.getAdminStats();
      break;
    case 'teacher':
      data = await dashboardService.getTeacherStats(userId);
      break;
    case 'student':
      data = await dashboardService.getStudentStats(userId);
      break;
    case 'parent':
      data = await dashboardService.getParentStats(userId);
      break;
    default:
      data = {};
  }

  res.status(200).json(new ApiResponse(200, data, 'Dashboard data retrieved'));
});

module.exports = { getDashboard };
