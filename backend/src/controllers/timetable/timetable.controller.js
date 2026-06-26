const timetableService = require('../../services/timetable.service');
const ApiResponse      = require('../../utils/ApiResponse');
const asyncHandler     = require('../../utils/asyncHandler');

/** Admin / teacher: create a timetable for a class */
const createTimetable = asyncHandler(async (req, res) => {
  const timetable = await timetableService.createTimetable({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json(new ApiResponse(201, { timetable }, 'Timetable created successfully'));
});

/** Get the active timetable for a class */
const getTimetableByClass = asyncHandler(async (req, res) => {
  const timetable = await timetableService.getByClass(req.params.classId);
  res.status(200).json(new ApiResponse(200, { timetable }, 'Timetable retrieved'));
});

/** Get all timetables (history) for a class */
const getAllTimetablesByClass = asyncHandler(async (req, res) => {
  const timetables = await timetableService.getAllByClass(req.params.classId);
  res.status(200).json(new ApiResponse(200, { timetables }, 'Timetables retrieved'));
});

/** Get the active timetable for a specific teacher */
const getTimetableByTeacher = asyncHandler(async (req, res) => {
  const timetables = await timetableService.getByTeacher(req.params.teacherId);
  res.status(200).json(new ApiResponse(200, { timetables }, 'Teacher timetable retrieved'));
});

/** Admin: update an existing timetable */
const updateTimetable = asyncHandler(async (req, res) => {
  const timetable = await timetableService.updateTimetable(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { timetable }, 'Timetable updated'));
});

/** Admin: delete a timetable */
const deleteTimetable = asyncHandler(async (req, res) => {
  await timetableService.deleteTimetable(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Timetable deleted'));
});

module.exports = {
  createTimetable,
  getTimetableByClass,
  getAllTimetablesByClass,
  getTimetableByTeacher,
  updateTimetable,
  deleteTimetable,
};
