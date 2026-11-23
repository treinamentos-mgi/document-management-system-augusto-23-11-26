const path = require('node:path');
const { randomUUID } = require('node:crypto');
const express = require('express');
const multer = require('multer');
const config = require('../config');
const documentsController = require('../controllers/documents.controller');
const { AppError } = require('../errors');

const EXTENSION_PATTERN = /^\.[a-z0-9]{1,10}$/i;

function buildStoredName(originalName) {
  const extension = path.extname(path.basename(originalName));
  return EXTENSION_PATTERN.test(extension) ? `${randomUUID()}${extension}` : randomUUID();
}

const upload = multer({
  storage: multer.diskStorage({
    destination: config.storageDir,
    filename: (req, file, cb) => cb(null, buildStoredName(file.originalname)),
  }),
  limits: { fileSize: config.maxFileSizeBytes, files: 1 },
});

function toUploadError(err) {
  if (!(err instanceof multer.MulterError)) {
    return err;
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError(413, `O arquivo excede o limite de ${config.maxFileSizeMb} MB.`);
  }
  return new AppError(400, 'Envie um único arquivo no campo "file".');
}

function uploadSingleFile(req, res, next) {
  upload.single('file')(req, res, (err) => next(err ? toUploadError(err) : undefined));
}

const router = express.Router();

router.post('/upload', documentsController.requireUserId, uploadSingleFile, documentsController.uploadDocument);
router.get('/documents', documentsController.requireUserId, documentsController.listDocuments);
router.get('/documents/:id/download', documentsController.requireUserId, documentsController.downloadDocument);

module.exports = router;
