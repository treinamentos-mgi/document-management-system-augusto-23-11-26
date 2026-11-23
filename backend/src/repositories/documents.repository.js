const path = require('node:path');
const config = require('../config');

// Metadados mantidos em memória (RNF-02). Arquivos ficam em config.storageDir.
const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findById(id) {
  return documents.get(id) ?? null;
}

function findByOwner(owner) {
  return [...documents.values()].filter((document) => document.owner === owner);
}

function getFilePath(document) {
  return path.join(config.storageDir, document.storedName);
}

module.exports = { save, findById, findByOwner, getFilePath };
