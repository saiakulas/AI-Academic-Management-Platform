const resultService = require('../../services/result.service');
const ApiResponse   = require('../../utils/ApiResponse');
const asyncHandler  = require('../../utils/asyncHandler');

const createResult = asyncHandler(async (req, res) => {
  const result = await resultService.createResult(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, { result }, 'Result published successfully'));
});

const listResults = asyncHandler(async (req, res) => {
  const data = await resultService.listResults(req.query);
  res.status(200).json(new ApiResponse(200, data, 'Results retrieved'));
});

const getResultById = asyncHandler(async (req, res) => {
  const result = await resultService.getResultById(req.params.id);
  res.status(200).json(new ApiResponse(200, { result }, 'Result retrieved'));
});

const getStudentResults = asyncHandler(async (req, res) => {
  const data = await resultService.getStudentResults(req.params.studentId, req.query);
  res.status(200).json(new ApiResponse(200, data, 'Student results retrieved'));
});

const updateResult = asyncHandler(async (req, res) => {
  const result = await resultService.updateResult(req.params.id, req.body, req.user.role);
  res.status(200).json(new ApiResponse(200, { result }, 'Result updated'));
});

const togglePublish = asyncHandler(async (req, res) => {
  const result = await resultService.togglePublish(req.params.id, req.body.isPublished);
  res.status(200).json(new ApiResponse(200, { result }, 'Publish status updated'));
});

const deleteResult = asyncHandler(async (req, res) => {
  const data = await resultService.deleteResult(req.params.id);
  res.status(200).json(new ApiResponse(200, data, data.message));
});

const getClassPerformance = asyncHandler(async (req, res) => {
  const { academicYear } = req.query;
  const data = await resultService.getClassPerformance(req.params.classId, academicYear);
  res.status(200).json(new ApiResponse(200, data, 'Class performance retrieved'));
});

module.exports = {
  createResult, listResults, getResultById, getStudentResults,
  updateResult, togglePublish, deleteResult, getClassPerformance,
};
