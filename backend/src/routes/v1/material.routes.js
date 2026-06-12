const express = require('express');
const router  = express.Router();

const {
  createMaterial, listMaterials, getMaterialById,
  updateMaterial, deleteMaterial, downloadMaterial,
} = require('../../controllers/materials/material.controller');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { handleUpload } = require('../../middleware/upload.middleware');
const validate = require('../../middleware/validate');
const { updateMaterialSchema } = require('../../validators/material.validator');

router.use(authenticate);

// Admin & teacher upload materials (multipart/form-data)
router.post('/',
  authorize('admin', 'teacher'),
  handleUpload,                   // parse multipart, save file
  createMaterial
);

// All authenticated users can view / download
router.get('/',    authorize('admin','teacher','student'), listMaterials);
router.get('/:id', authorize('admin','teacher','student'), getMaterialById);
router.post('/:id/download', authorize('admin','teacher','student'), downloadMaterial);

// Admin & teacher manage their own materials
router.patch('/:id',  authorize('admin','teacher'), validate(updateMaterialSchema), updateMaterial);
router.delete('/:id', authorize('admin','teacher'), deleteMaterial);

module.exports = router;
