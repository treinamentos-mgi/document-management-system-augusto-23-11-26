class DocumentNotFoundError extends Error {
  constructor() {
    super('Documento não encontrado.');
    this.name = 'DocumentNotFoundError';
  }
}

class DocumentAccessDeniedError extends Error {
  constructor() {
    super('Você não tem permissão para acessar este documento.');
    this.name = 'DocumentAccessDeniedError';
  }
}

module.exports = { DocumentNotFoundError, DocumentAccessDeniedError };