const teacherService = require('../../services/teacher.service');
const ApiResponse    = require('../../utils/ApiResponse');
const asyncHandler   = require('../../utils/asyncHandler');

const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await teacherService.createTeacher(req.body);
  res.status(201).json(new ApiResponse(201, { teacher }, 'Teacher created successfully'));
});

const listTeachers = asyncHandler(async (req, res) => {
  const result = await teacherService.listTeachers(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Teachers retrieved'));
});

const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await teacherService.getTeacherById(req.params.id);
  res.status(200).json(new ApiResponse(200, { teacher }, 'Teacher retrieved'));
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await teacherService.updateTeacher(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { teacher }, 'Teacher updated'));
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const result = await teacherService.deleteTeacher(req.params.id);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

module.exports = { createTeacher, listTeachers, getTeacherById, updateTeacher, deleteTeacher };
