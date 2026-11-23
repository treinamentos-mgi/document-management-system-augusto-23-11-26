const documentsService = require('../services/documents.service');
const { AppError } = require('../errors');

function requireUserId(req, res, next) {
  const owner = req.get('X-User-Id')?.trim();
  if (!owner) {
    return next(new AppError(400, 'O cabeçalho X-User-Id é obrigatório.'));
  }
  res.locals.owner = owner;
  next();
}

function toPublicDocument({ id, originalName, mimeType, size, uploadedAt, owner }) {
  return { id, originalName, mimeType, size, uploadedAt, owner };
}

function uploadDocument(req, res) {
  if (!req.file) {
    throw new AppError(400, 'Envie um arquivo no campo "file".');
  }
  const document = documentsService.createDocument({
    owner: res.locals.owner,
    file: {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });
  res.status(201).json(toPublicDocument(document));
}

function listDocuments(req, res) {
  const documents = documentsService.listDocumentsByOwner(res.locals.owner);
  res.json(documents.map(toPublicDocument));
}

function downloadDocument(req, res, next) {
  const { document, filePath } = documentsService.getDocumentForDownload({
    id: req.params.id,
    owner: res.locals.owner,
  });

  res.type(document.mimeType);
  res.download(filePath, document.originalName, (err) => {
    if (!err || res.headersSent) {
      return;
    }
    if (err.code === 'ENOENT' || err.status === 404) {
      return next(new AppError(404, 'Arquivo não encontrado no armazenamento.'));
    }
    next(err);
  });
}

module.exports = { requireUserId, uploadDocument, listDocuments, downloadDocument };
