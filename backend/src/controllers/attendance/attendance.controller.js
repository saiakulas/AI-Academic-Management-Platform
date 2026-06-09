const attendanceService = require('../../services/attendance.service');
const ApiResponse       = require('../../utils/ApiResponse');
const asyncHandler      = require('../../utils/asyncHandler');

const markAttendance = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.markAttendance({
    ...req.body,
    markedBy: req.user._id,
  });
  res.status(201).json(new ApiResponse(201, { attendance }, 'Attendance marked successfully'));
});

const updateAttendance = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.updateAttendance(req.params.id, req.body.records);
  res.status(200).json(new ApiResponse(200, { attendance }, 'Attendance updated'));
});

const getClassAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.getClassAttendance({
    classId: req.params.classId,
    ...req.query,
  });
  res.status(200).json(new ApiResponse(200, result, 'Attendance retrieved'));
});

const getStudentAttendanceSummary = asyncHandler(async (req, res) => {
  const summary = await attendanceService.getStudentAttendanceSummary(
    req.params.studentId,
    req.query
  );
  res.status(200).json(new ApiResponse(200, { summary }, 'Attendance summary retrieved'));
});

const getTodaySummary = asyncHandler(async (req, res) => {
  const summary = await attendanceService.getTodaySummary();
  res.status(200).json(new ApiResponse(200, { summary }, "Today's attendance summary"));
});

module.exports = {
  markAttendance, updateAttendance,
  getClassAttendance, getStudentAttendanceSummary, getTodaySummary,
};
