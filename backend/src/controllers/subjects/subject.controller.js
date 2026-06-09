const subjectService = require('../../services/subject.service');
const ApiResponse    = require('../../utils/ApiResponse');
const asyncHandler   = require('../../utils/asyncHandler');

const createSubject = asyncHandler(async (req, res) => {
  const subject = await subjectService.createSubject(req.body);
  res.status(201).json(new ApiResponse(201, { subject }, 'Subject created successfully'));
});

const listSubjects = asyncHandler(async (req, res) => {
  const result = await subjectService.listSubjects(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Subjects retrieved'));
});

const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await subjectService.getSubjectById(req.params.id);
  res.status(200).json(new ApiResponse(200, { subject }, 'Subject retrieved'));
});

const updateSubject = asyncHandler(async (req, res) => {
  const subject = await subjectService.updateSubject(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { subject }, 'Subject updated'));
});

const deleteSubject = asyncHandler(async (req, res) => {
  const result = await subjectService.deleteSubject(req.params.id);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

module.exports = { createSubject, listSubjects, getSubjectById, updateSubject, deleteSubject };
