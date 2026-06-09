const classService = require('../../services/class.service');
const ApiResponse  = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const createClass = asyncHandler(async (req, res) => {
  const cls = await classService.createClass(req.body);
  res.status(201).json(new ApiResponse(201, { class: cls }, 'Class created successfully'));
});

const listClasses = asyncHandler(async (req, res) => {
  const result = await classService.listClasses(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Classes retrieved'));
});

const getClassById = asyncHandler(async (req, res) => {
  const cls = await classService.getClassById(req.params.id);
  res.status(200).json(new ApiResponse(200, { class: cls }, 'Class retrieved'));
});

const updateClass = asyncHandler(async (req, res) => {
  const cls = await classService.updateClass(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { class: cls }, 'Class updated'));
});

const deleteClass = asyncHandler(async (req, res) => {
  const result = await classService.deleteClass(req.params.id);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const assignSubjectTeacher = asyncHandler(async (req, res) => {
  const { subjectId, teacherId } = req.body;
  const cls = await classService.assignSubjectTeacher(req.params.id, subjectId, teacherId);
  res.status(200).json(new ApiResponse(200, { class: cls }, 'Subject-teacher assigned'));
});

const getStudentsInClass = asyncHandler(async (req, res) => {
  const result = await classService.getStudentsInClass(req.params.id, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Students in class retrieved'));
});

module.exports = { createClass, listClasses, getClassById, updateClass, deleteClass, assignSubjectTeacher, getStudentsInClass };
