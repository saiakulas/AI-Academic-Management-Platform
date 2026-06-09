const assignmentService = require('../../services/assignment.service');
const ApiResponse       = require('../../utils/ApiResponse');
const asyncHandler      = require('../../utils/asyncHandler');

const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.createAssignment({
    ...req.body,
    assignedBy: req.user._id,
  });
  res.status(201).json(new ApiResponse(201, { assignment }, 'Assignment created successfully'));
});

const listAssignments = asyncHandler(async (req, res) => {
  const result = await assignmentService.listAssignments(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Assignments retrieved'));
});

const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.getAssignmentById(req.params.id);
  res.status(200).json(new ApiResponse(200, { assignment }, 'Assignment retrieved'));
});

const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.updateAssignment(
    req.params.id, req.body,
    req.user._id.toString(), req.user.role
  );
  res.status(200).json(new ApiResponse(200, { assignment }, 'Assignment updated'));
});

const deleteAssignment = asyncHandler(async (req, res) => {
  const result = await assignmentService.deleteAssignment(
    req.params.id,
    req.user._id.toString(), req.user.role
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.submitAssignment(
    req.params.id, req.user._id, req.body
  );
  res.status(200).json(new ApiResponse(200, { assignment }, 'Assignment submitted successfully'));
});

const gradeSubmission = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.gradeSubmission(
    req.params.id, req.params.submissionId,
    req.body, req.user._id
  );
  res.status(200).json(new ApiResponse(200, { assignment }, 'Submission graded'));
});

module.exports = {
  createAssignment, listAssignments, getAssignmentById,
  updateAssignment, deleteAssignment, submitAssignment, gradeSubmission,
};
