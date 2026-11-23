const { randomUUID } = require('node:crypto');
const documentsRepository = require('../repositories/documents.repository');
const { AppError } = require('../errors');

function createDocument({ owner, file }) {
  const document = {
    id: randomUUID(),
    originalName: file.originalName,
    storedName: file.storedName,
    mimeType: file.mimeType,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  };
  return documentsRepository.save(document);
}

function listDocumentsByOwner(owner) {
  return documentsRepository.findByOwner(owner);
}

function getDocumentForDownload({ id, owner }) {
  const document = documentsRepository.findById(id);
  if (!document) {
    throw new AppError(404, 'Documento não encontrado.');
  }
  if (document.owner !== owner) {
    throw new AppError(403, 'Você não tem permissão para acessar este documento.');
  }
  return { document, filePath: documentsRepository.getFilePath(document) };
}

module.exports = { createDocument, listDocumentsByOwner, getDocumentForDownload };
