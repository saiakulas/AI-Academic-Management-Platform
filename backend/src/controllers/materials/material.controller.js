const studyMaterialService = require('../../services/studyMaterial.service');
const ApiResponse  = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { getFileType } = require('../../middleware/upload.middleware');
const ApiError = require('../../utils/ApiError');

const createMaterial = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'File is required');

  const fileUrl  = `/uploads/${req.file.filename}`;
  const fileType = getFileType(req.file.mimetype);

  const material = await studyMaterialService.create(
    {
      ...req.body,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType,
    },
    req.user._id
  );
  res.status(201).json(new ApiResponse(201, { material }, 'Study material uploaded successfully'));
});

const listMaterials = asyncHandler(async (req, res) => {
  const data = await studyMaterialService.list(req.query);
  res.status(200).json(new ApiResponse(200, data, 'Study materials retrieved'));
});

const getMaterialById = asyncHandler(async (req, res) => {
  const material = await studyMaterialService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, { material }, 'Study material retrieved'));
});

const updateMaterial = asyncHandler(async (req, res) => {
  const material = await studyMaterialService.update(
    req.params.id, req.body,
    req.user._id.toString(), req.user.role
  );
  res.status(200).json(new ApiResponse(200, { material }, 'Material updated'));
});

const deleteMaterial = asyncHandler(async (req, res) => {
  const data = await studyMaterialService.delete(
    req.params.id,
    req.user._id.toString(), req.user.role
  );
  res.status(200).json(new ApiResponse(200, data, data.message));
});

const downloadMaterial = asyncHandler(async (req, res) => {
  await studyMaterialService.incrementDownloads(req.params.id);
  const material = await studyMaterialService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, { fileUrl: material.fileUrl }, 'Download ready'));
});

module.exports = { createMaterial, listMaterials, getMaterialById, updateMaterial, deleteMaterial, downloadMaterial };
