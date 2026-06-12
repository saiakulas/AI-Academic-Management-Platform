const multer  = require('multer');
const path    = require('path');
const crypto  = require('crypto');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = {
  'application/pdf':                                'pdf',
  'application/msword':                             'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-powerpoint':                  'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'image/jpeg':  'image',
  'image/png':   'image',
  'image/gif':   'image',
  'image/webp':  'image',
  'video/mp4':   'video',
  'video/webm':  'video',
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext    = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new ApiError(415, `Unsupported file type: ${file.mimetype}. Allowed: PDF, Word, PowerPoint, images, video.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * Single file upload — field name "file"
 */
const uploadSingle = upload.single('file');

/**
 * Express middleware wrapper with proper error handling
 */
const handleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(413, `File too large. Maximum size is ${MAX_FILE_SIZE / 1048576}MB`));
    }
    if (err instanceof ApiError) return next(err);
    return next(new ApiError(400, err.message || 'File upload failed'));
  });
};

/**
 * Helper: get file type from MIME
 */
const getFileType = (mimetype) => ALLOWED_MIME_TYPES[mimetype] || 'other';

module.exports = { handleUpload, getFileType };
