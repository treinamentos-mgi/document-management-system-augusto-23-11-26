const path = require('node:path');

const DEFAULT_MAX_FILE_SIZE_MB = 10;
const BYTES_PER_MB = 1024 * 1024;

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB) || DEFAULT_MAX_FILE_SIZE_MB;

module.exports = {
  port: Number(process.env.PORT) || 3000,
  storageDir: process.env.STORAGE_DIR
    ? path.resolve(process.env.STORAGE_DIR)
    : path.join(__dirname, '..', 'storage'),
  maxFileSizeMb,
  maxFileSizeBytes: maxFileSizeMb * BYTES_PER_MB,
};
