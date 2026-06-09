const studentService = require('../../services/student.service');
const ApiResponse    = require('../../utils/ApiResponse');
const asyncHandler   = require('../../utils/asyncHandler');

const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body);
  res.status(201).json(new ApiResponse(201, { student }, 'Student created successfully'));
});

const listStudents = asyncHandler(async (req, res) => {
  const result = await studentService.listStudents(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Students retrieved'));
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  res.status(200).json(new ApiResponse(200, { student }, 'Student retrieved'));
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { student }, 'Student updated'));
});

const deleteStudent = asyncHandler(async (req, res) => {
  const result = await studentService.deleteStudent(req.params.id);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const assignParents = asyncHandler(async (req, res) => {
  const student = await studentService.assignParents(req.params.id, req.body.parentIds);
  res.status(200).json(new ApiResponse(200, { student }, 'Parents assigned successfully'));
});

module.exports = { createStudent, listStudents, getStudentById, updateStudent, deleteStudent, assignParents };
